package com.missoandfriends.jsonapi.services;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import javax.validation.ValidationException;

import org.apache.commons.lang3.RandomStringUtils;
import org.imgscalr.Scalr;
import org.imgscalr.Scalr.Mode;
import org.imgscalr.Scalr.Rotation;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Directory;
import com.drew.metadata.Metadata;
import com.drew.metadata.Tag;
import com.missoandfriends.jsonapi.exceptions.GeneralServer500Exception;
import com.missoandfriends.jsonapi.exceptions.PayloadTooLarge413Exception;

public class FileUploadService {
	
	private static String avatarPath;
	private static String coverPath;
	private static String externalPath;
	private static String coverExtPath;
	private static long   maxFileSize;
	private static int    bufferSize;
	
	public static final int MINIFIED_IMAGE_SIZE    = 50;
	public static final int MEDIUM_IMAGE_SIZE      = 300;
	public static final String FULL_IMAGE_SUFFIX   = "-bpfull.";
	public static final String MEDIUM_IMAGE_SUFFIX = "-bpmedium.";
	public static final String THUMB_IMAGE_SUFFIX  = "-bpthumb.";
	public static final char FOLDER_SEPARATOR      = '/';
	
	public static void init(final Properties props) {
		avatarPath 	 = props.getProperty("file.avatarpath");
		coverPath    = props.getProperty("file.coverpath");
		externalPath = props.getProperty("file.externalpath");
		coverExtPath = props.getProperty("file.coverextpath");
		maxFileSize  = Long.valueOf(props.getProperty("file.maxfilesize"));
		bufferSize   = Integer.valueOf(props.getProperty("file.buffersize", "8196"));
	}
	
	public String getImageExt(final ByteArrayOutputStream baos) throws IOException {
		try (final InputStream bais = new ByteArrayInputStream(baos.toByteArray());
			 final ImageInputStream imio = ImageIO.createImageInputStream(bais);) {
			final Iterator<ImageReader> iter = ImageIO.getImageReaders(imio);
			if (!iter.hasNext()) {
				return null;
			}
			final ImageReader reader = iter.next();
			final String ext = reader.getFormatName().toLowerCase();
			switch (ext) {
			case "jpg":
			case "jpeg":
			case "png":
			case "gif":
				break;
			default:
				return null;
			}
			return ext;
		}
	}
	
	/**
	 * get list of relative filepaths from folder
	 * @param userId - user id, which define folder name
	 * @return
	 * @throws GeneralServer500Exception
	 */
	public List<String> getFilesFromDirectory(final String userId) throws GeneralServer500Exception {
		File folder = new File(avatarPath + "/" + userId);
		List<String> rel = new ArrayList<>();
		final File[] listFiles = folder.listFiles();
		if (listFiles != null) {
			for (final File file: listFiles) {
				if (!file.isDirectory()) {
					rel.add(file.getName());
				}
			}
		}
		return rel;
	}
	
	public String getCoverImageFromDirectory(final String groupId) throws GeneralServer500Exception {
		final StringBuilder sb = new StringBuilder();
		sb.append(coverPath).append(FOLDER_SEPARATOR).append(groupId).append("/cover-image");
		File folder = new File(sb.toString());
		final File[] listFiles = folder.listFiles();
		if (listFiles != null) {
			for (final File file: listFiles) {
				if (!file.isDirectory()) {
					sb.setLength(0);
					return sb.append(coverExtPath).append(FOLDER_SEPARATOR).append(groupId).append("/cover-image/").append(file.getName()).toString();				
				}
			}
		}
		return null;
	}
	
	public String minifyOnFly(final File file) {
		try (FileInputStream fis = new FileInputStream(file);
			 ByteArrayOutputStream baos = new ByteArrayOutputStream();) {
			int read = 0;
			byte buffer[] = new byte[bufferSize];
			do {
				read = fis.read(buffer);
				if (read < 0) {
					break;
				}
				baos.write(buffer, 0, read);			    
			} while (true);
			baos.flush();	
			String orient = "";
			try {
				final InputStream xinputStream = new ByteArrayInputStream(baos.toByteArray());
				Metadata metadata = ImageMetadataReader.readMetadata(xinputStream);
				for (Directory directory : metadata.getDirectories()) {
				    for (Tag tag : directory.getTags()) {
				    	final String name = tag.getTagName();
				    	if ("Orientation".equals(name)) {
				    		orient = tag.getDescription();
				    	}				    	
				    }
				}
			} catch (final Exception e) {
				e.printStackTrace(System.err);
			}
			Pattern myPattern = Pattern.compile("\\.(png|gif|jpg|jpeg)$");
			Matcher m = myPattern.matcher(file.getAbsolutePath());
			m.find();
			String ext = m.group(1);
			//Impossible variant, but, WP sucks, so just try to save situation: get extension from file internals
			if (ext == null) {
				baos.flush();
				ext = getImageExt(baos);
			}
			String folderName = file.getParentFile().getAbsolutePath();
			String fileNoExtNoEnd = file.getName().replaceAll(FULL_IMAGE_SUFFIX + ext, "");
			final StringBuilder sb = new StringBuilder();
			final String somefilename = sb.append(folderName).append("/").append(fileNoExtNoEnd).append(MEDIUM_IMAGE_SUFFIX).append(ext).toString();			
			this.minify(file.getAbsolutePath(), MEDIUM_IMAGE_SIZE, somefilename, ext, orient);
			sb.setLength(0);
			return sb.append(fileNoExtNoEnd).append(MEDIUM_IMAGE_SUFFIX).append(ext).toString();
		} catch (IOException e) {
			
		}
		return null;
	}
	
	public String getFullAbsBPImageFromDirectory(final String userId) {
		final StringBuilder sb = new StringBuilder();
		final String dirName = sb.append(avatarPath).append(FOLDER_SEPARATOR).append(userId).toString();
		File folder = new File(dirName);
		if (!folder.exists()) {
			return null;
		}
		final File[] listFiles = folder.listFiles(new FilenameFilter() {
			@Override
			public boolean accept(File dir, String name) {
		        return name != null && name.contains(MEDIUM_IMAGE_SUFFIX);
		    }
		});
		if (listFiles != null) {
			for (final File file: listFiles) {
				if (!file.isDirectory()) {
					sb.setLength(0);
					return sb.append(externalPath).append(FOLDER_SEPARATOR).append(userId).append(FOLDER_SEPARATOR).append(file.getName()).toString();
				}
			}		
		}
		final File[] listFiles2 = folder.listFiles(new FilenameFilter() {
			@Override
			public boolean accept(File dir, String name) {
		        return name != null && name.contains(FULL_IMAGE_SUFFIX);
		    }
		});
		if (listFiles2 != null) {
			for (final File file: listFiles2) {
				if (!file.isDirectory()) {
					final String filename = this.minifyOnFly(file);
					sb.setLength(0);
					return sb.append(externalPath).append(FOLDER_SEPARATOR).append(userId).append(FOLDER_SEPARATOR).append(filename).toString();
				}
			}
		}
		return null;
	}
	
	/**
	 * returns partial storepath but first check if directory exists. Folder name ends with /
	 * @param userId
	 * @return
	 */
	public String partialStoreFilepath(final String userId, final String filename) {
		final StringBuilder sb = new StringBuilder(avatarPath).append(FOLDER_SEPARATOR).append(userId);
		final File file = new File(sb.toString());
		if (!(file.exists() && file.isDirectory())) {
			file.setReadable(true, false);
			file.setExecutable(true, false);
			file.setWritable(true, false);
			file.mkdir();
		}
		return sb.append(FOLDER_SEPARATOR).toString();
	}
	
	public void removeAllfilesExcept(final String dirName, final String file1) {
		File folder = new File(dirName);
		final File[] listFiles = folder.listFiles(new FilenameFilter() {
			@Override
			public boolean accept(File dir, String name) {
				return !file1.equals(name);
		    }
		});
		if (listFiles != null) {
			for (final File file: listFiles) {
				if (file.isDirectory()) {
					continue;
				} else {
					file.delete();
				}
			}
		}
	}
	
	public void minify(final String filename, final int dim, final String out, final String ext, final String orient) throws IOException {
		final File file = new File(filename);
		final BufferedImage in = ImageIO.read(file);		
		BufferedImage thumbnail;		
		thumbnail = Scalr.resize(in, Scalr.Method.QUALITY, Mode.AUTOMATIC, dim, Scalr.OP_ANTIALIAS);	
		final Rotation rot = getRotation(orient);
		if (rot != null) {
			thumbnail = Scalr.rotate(thumbnail, rot, Scalr.OP_ANTIALIAS);	
		}
		File newFile = newFileWithPermissions(out);
		ImageIO.write(thumbnail, ext, newFile);
	}
	
	public Rotation getRotation(final String orient) {
		if (orient.startsWith("Right")) {			
			return Rotation.CW_90;	
		}
		if (orient.startsWith("Left")) {			
			return Rotation.CW_270;			
		}
		if (orient.startsWith("Bottom")) {			
			return Rotation.CW_180;			
		}
		return null;
	}
	
	public File newFileWithPermissions(final String filename) {
		final File file = new File(filename);
		file.setReadable(true, false);
		file.setExecutable(true, false);
		file.setWritable(true, false);
		return file;
	}

	/**
	 * Uploads file and returns external, server filename
	 * @param userId
	 * @param fis
	 * @return
	 * @throws PayloadTooLarge413Exception
	 * @throws GeneralServer500Exception
	 * @throws ValidationException
	 */
	public String uploadImage(final String userId, final InputStream fis) throws PayloadTooLarge413Exception, GeneralServer500Exception, ValidationException {
		try (final ByteArrayOutputStream baos = new ByteArrayOutputStream();) {
			int read = 0;
			final byte[] buffer = new byte[bufferSize];
			long counter = 0;
			do {
				read = fis.read(buffer);
				if (read < 0) {
					break;
				}
				baos.write(buffer, 0, read);
			    counter += read;
			    if (counter > maxFileSize) {
			    	throw new PayloadTooLarge413Exception("Payload size too large. Max size is " + maxFileSize);
			    }
			} while (true);
			baos.flush();
			final String ext = getImageExt(baos);
			if (ext == null) {
				throw new ValidationException("Unsupported file format");
			}
			String orient = "";
			try {
				final InputStream xinputStream = new ByteArrayInputStream(baos.toByteArray());
				Metadata metadata = ImageMetadataReader.readMetadata(xinputStream);
				for (Directory directory : metadata.getDirectories()) {
				    for (Tag tag : directory.getTags()) {
				    	final String name = tag.getTagName();
				    	if ("Orientation".equals(name)) {
				    		orient = tag.getDescription();
				    	}				    	
				    }
				}
			} catch (final Exception e) {
				e.printStackTrace(System.err);
			}			
			baos.flush();
			
			final String fileNoExtNoEnd = RandomStringUtils.random(13, "abcdefghijklmnopqrstuvwxyz1234567890");
			final String folderFilename = partialStoreFilepath(userId, fileNoExtNoEnd);
			
			final StringBuilder sb = new StringBuilder(256);
			
			final String fullImageLocalName = sb.append(fileNoExtNoEnd).append(FULL_IMAGE_SUFFIX).append(ext).toString();
			sb.setLength(0);
			final String fullImageAbsName   = sb.append(folderFilename).append(fullImageLocalName).toString();
			sb.setLength(0);
			final String thumbBPName 	    = sb.append(folderFilename).append(fileNoExtNoEnd).append(THUMB_IMAGE_SUFFIX).append(ext).toString();
			sb.setLength(0);
			final String thumbMdName 	    = sb.append(folderFilename).append(fileNoExtNoEnd).append(MEDIUM_IMAGE_SUFFIX).append(ext).toString();
			final File file = newFileWithPermissions(fullImageAbsName);
			try (final OutputStream outputStream = new FileOutputStream(file);
				 final InputStream inputStream = new ByteArrayInputStream(baos.toByteArray());) {
				do {
					read = inputStream.read(buffer);
					if (read < 0) {
						break;
					}
					outputStream.write(buffer, 0, read);
				} while (true);
				outputStream.flush();
			}
			removeAllfilesExcept(folderFilename, fullImageLocalName);
			
			BufferedImage thumbnail = null;	
			final BufferedImage in = ImageIO.read(file);
			final Rotation rot = getRotation(orient);
			if (rot != null) {
				thumbnail = Scalr.rotate(in, rot, Scalr.OP_ANTIALIAS);	
			}
			orient = "";
			File newFile = newFileWithPermissions(fullImageAbsName);
			if (thumbnail != null) {
				ImageIO.write(thumbnail, ext, newFile);
			}
			ExecutorService taskExecutor = Executors.newFixedThreadPool(2);
			
			final String theOrient = orient;
			taskExecutor.execute(new Runnable() {
				@Override
				public void run() {
					try {
						minify(fullImageAbsName, MINIFIED_IMAGE_SIZE, thumbBPName, ext, theOrient);
					} catch (final IOException e) {;}
				}
			});
			taskExecutor.execute(new Runnable() {
				@Override
				public void run() {
					try {
						minify(fullImageAbsName, MEDIUM_IMAGE_SIZE,   thumbMdName, ext, theOrient);
					} catch (final IOException e) {;}
				}
			});
			taskExecutor.shutdown();
			try {
				taskExecutor.awaitTermination(60, TimeUnit.SECONDS);
			} catch (final InterruptedException e) {
				e.printStackTrace(System.err);
			}
			sb.setLength(0);
			return sb.append(externalPath).append(FOLDER_SEPARATOR).append(userId).append(FOLDER_SEPARATOR).append(fullImageLocalName).toString();
		} catch (final IOException e) {
			throw new GeneralServer500Exception(e.getMessage(), e);
		}
	}
	
}
