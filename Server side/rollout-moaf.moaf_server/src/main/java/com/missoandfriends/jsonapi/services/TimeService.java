package com.missoandfriends.jsonapi.services;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.LocalDate;
import org.joda.time.Years;

import com.missoandfriends.jsonapi.MOFServer;

public class TimeService {
	public static final String ISO8601Z               = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
	public static final String MYSQL_TIMESTAMP_FORMAT = "yyyy-MM-dd HH:mm:ss";
	public static final String MYSQL_DATE_FORMAT      = "yyyy-MM-dd";
	public static final String ISO8601Z_REGEXP        = "^[1,2][0-9]{3,3}-[0,1][0-9]-[0-3][0-9] [0-2][0-9]\\:[0-2][0-9]\\:[0-2][0-9]Z(\\+\\-)?([0-9]{1,3})?$";
	
	public final static String DATETIME_US_FORMAT 	    = "MM/dd/yyyy hh:mm:ss aaa";
	public final static String DATETIME_FILE_FORMAT     = "yyyy_MM_dd'T'HH_mm_ss_SSS";
	public final static String DATE_BASED_FOLDER_FORMAT = "yyyy/MM";
	public final static String BBP_BIRTHDAY				= "MM/dd/yyyy";
	
	private static String GMT_SHIFT;
	private static TimeZone GMT_ZONE;
	
	private static DateFormat usDatetimeFormat       = new SimpleDateFormat(DATETIME_US_FORMAT, Locale.US);
	private static DateFormat filenameDatetimeFormat = new SimpleDateFormat(DATETIME_FILE_FORMAT, Locale.US);
	
	public static void init () {
		GMT_SHIFT = "GMT" + String.valueOf(MOFServer.getTimeShift());
		GMT_ZONE  = TimeZone.getTimeZone(GMT_SHIFT);		
	}
	
	public static java.sql.Date toSQLDate(final Date date) {
		return new java.sql.Date( date.getTime() );
	}
	
	public static Date isoStringToDate(final String iso) {
		if (StringUtils.isBlank(iso)) {
			return null;
		}
		final DateFormat df = new SimpleDateFormat(ISO8601Z);
		try {
			return df.parse(iso);
		} catch (final ParseException e) {
			e.printStackTrace(System.err);
			return null;
		}
	}
	
	public static String dateToISO8601Z (final Date date) {
		final DateFormat df = new SimpleDateFormat(ISO8601Z);
		return df.format(date);
	}
	
	public static SimpleDateFormat getMysqlTimestampFormat() {
		SimpleDateFormat df = new SimpleDateFormat(MYSQL_TIMESTAMP_FORMAT);		
		df.setTimeZone(GMT_ZONE);
		return df;
	}
	
	public static SimpleDateFormat getBBPBirthdayFormat() {
		SimpleDateFormat df = new SimpleDateFormat(BBP_BIRTHDAY);
		return df;
	}
	
	public static SimpleDateFormat getMysqlTimestampFormatNoShift() {
		return new SimpleDateFormat(MYSQL_TIMESTAMP_FORMAT);		
	}
	
	public static SimpleDateFormat getDateBasedFolderNameFormat() {
		return new SimpleDateFormat(DATE_BASED_FOLDER_FORMAT);
	}
	
	public static SimpleDateFormat getMysqlDateFormat() {
		return new SimpleDateFormat(MYSQL_DATE_FORMAT);
	}
	
	public static int yearsBetween(final Date from, final Date to) {
		final LocalDate date1 = new LocalDate(to);
		final LocalDate date2 = new LocalDate(from);
		return Math.abs(Years.yearsBetween(date2, date1).getYears());
	}
	
	public static int yearsBetween(final Date to) {
		final LocalDate date1 = new LocalDate(to);
		final LocalDate date2 = new LocalDate(new Date());
		return Math.abs(Years.yearsBetween(date2, date1).getYears());
	}
	
	public static String getCurrentDatetimeUSString() {
		return usDatetimeFormat.format(new Date());
	}
	
	public static String getCurrentDatetimeAsFilename () {
		return filenameDatetimeFormat.format(new Date());
	}
}
















