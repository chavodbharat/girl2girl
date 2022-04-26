<?php
function encrypt( $text, $key = null, $mcrypt_cipher_name = false ) {
	$use_mcrypt = true;

	
	$mcrypt_cipher_name = $mcrypt_cipher_name === false ? MCRYPT_RIJNDAEL_256 : $mcrypt_cipher_name;
	$iv_size            = mcrypt_get_iv_size( $mcrypt_cipher_name, MCRYPT_MODE_ECB );
	$key                = ! is_null( $key ) ? $key : substr( md5( 'B+|9x=]j(F7btO*wl#Ob2)8F:ze3@N6D|aniE2Xc-b5KpE3KQgoh lIS^NxzM-VgJLau}2w+*xBPH<wW%}|XipB+j=%w=yI-S1,R]1>-SM~2wMLj4{08VM`,~t+ZgaA<' ), 0, $iv_size );
	$encrypted_value = trim( base64_encode( mcrypt_encrypt( $mcrypt_cipher_name, $key, $text, MCRYPT_MODE_ECB, mcrypt_create_iv( $iv_size, MCRYPT_RAND ) ) ) );

	return $encrypted_value;
}
echo encrypt($argv[1]);
?>