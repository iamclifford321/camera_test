<?php

$to      = 'clifford@alphasys.com.au';
$subject = 'the subject';
$message = 'hello';
$headers = array(
  'From' => 'webmaster@example.com',
  'Reply-To' => 'webmaster@example.com',
  'X-Mailer' => 'PHP/' . phpversion()
);
// echo "asd";
echo mail($to, $subject, $message, $headers);
 ?>
