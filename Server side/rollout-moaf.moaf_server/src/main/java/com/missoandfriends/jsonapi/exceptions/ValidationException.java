package com.missoandfriends.jsonapi.exceptions;

import java.util.ArrayList;
import java.util.List;

import net.sf.oval.ConstraintViolation;

public class ValidationException extends Exception {

	public static final String ERR_SEP = ", ";
	public static final int ERR_SEP_LEN = ERR_SEP.length();
	
	private List<ConstraintViolation> cvs = new ArrayList<>();
	
	private static final long serialVersionUID = 8287953272950975353L;
	
	public ValidationException (final List<ConstraintViolation> cvs) {
		this.cvs = cvs;
	}
	
	public ValidationException (final String message) {
		super(message);
	}
	
	@Override
	public String getMessage() {
		final StringBuilder sb = new StringBuilder();
		if (cvs.isEmpty()) {
			return super.getMessage();
		}
		for (final ConstraintViolation cv: this.cvs) {
			sb.append(cv.getMessage()).append(ERR_SEP);
			final ConstraintViolation[] cvos = cv.getCauses();
			if (cvos != null) {
				for (final ConstraintViolation cvo: cv.getCauses()) {
					sb.append(" [caused by] " + cvo.getMessage()).append(ERR_SEP);
				}
			}
		}
		return sb.delete(sb.length() - ERR_SEP_LEN, sb.length()).toString();
	}
	
}
