<?php
/** turn on errors */
error_reporting(-1);
ini_set("display_errors", "On");

/** set php headers */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

/** import phpmailer */
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

/** composer autoloader */
require "../vendor/autoload.php";

/** get input variables */
$json = json_decode(file_get_contents("php://input"));
function get($key)
{
  global $json;
  return isset($json->{$key}) ? $json->{$key} : "";
}
$fromAddress = get("fromAddress");
$fromName = get("fromName");
$toAddress = get("toAddress");
$toName = get("toName");
$ccAddress = get("ccAddress");
$ccName = get("ccName");
$subject = get("subject");
$html = get("html");
$plain = get("plain");
$token = get("token");

/** check for all input variables */
if (
  empty($fromAddress) ||
  empty($toAddress) ||
  empty($subject) ||
  empty($html) ||
  empty($plain)
) {
  echo "Incomplete inputs";
  exit(1);
}

/** verify captcha */
if (!empty($token)) {
  try {
    $secret = "6LcLcs8ZAAAAANiFb04QVyJJ24EGBwMByDBqhcWv";
    $url = "https://www.google.com/recaptcha/api/siteverify?secret={$secret}&response={$token}";
    $response = json_decode(file_get_contents($url));
    echo "Captcha score: {$response->score}\r\n";
    if ($response->success === false) {
      throw new Exception("Invalid token");
    } else if ($response->score < 0.5) {
      echo "Captcha failed";
      exit(1);
    }
  } catch (Exception $error) {
    echo "Error verifying captcha: {$error}\r\n";
  }
}

/** start phpmailer */
$mail = new PHPMailer(true);

/** set charset for special characters, eg emdash */
$mail->CharSet = "UTF-8";

try {
  /** server settings */
  $mail->SMTPDebug = SMTP::DEBUG_SERVER;
  $mail->isSMTP();
  $mail->Host = "mail.vincentrubinetti.com";
  $mail->SMTPAuth = true;
  $mail->Username = "vince@vincentrubinetti.com";
  $mail->Password = "5dzeRZJAamnUuK";
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
  $mail->Port = (int) "465";

  /** message recipients */
  $mail->setFrom("vince@vincentrubinetti.com", "Vincent Rubinetti");
  $mail->addReplyTo($fromAddress, $fromName);
  $mail->addAddress($toAddress, $toName);
  if (!empty($ccAddress)) {
    $mail->addCC($ccAddress, $ccName);
  }

  /** message content */
  $mail->isHTML(true);
  $mail->Subject = $subject;
  $mail->Body = $html;
  $mail->AltBody = $plain;

  /** send message */
  $mail->send();

  /** success */
  echo "Mail sent successfully!";
  exit(0);
} catch (Exception $error) {
  /** error */
  echo "Error sending mail: {$mail->ErrorInfo}";
  exit(1);
}
?>