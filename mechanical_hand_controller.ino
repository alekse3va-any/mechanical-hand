#include <Servo.h>

const int SERVO_PIN = 9;
const int BUTTON_PIN = 2;

const int OPEN_ANGLE = 25;
const int CLOSED_ANGLE = 115;
const int STEP_DELAY = 8;

Servo driveServo;
int currentAngle = OPEN_ANGLE;
String handState = "open";

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  driveServo.attach(SERVO_PIN);
  driveServo.write(OPEN_ANGLE);
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    command.toUpperCase();

    if (command == "OPEN") {
      moveServo(OPEN_ANGLE);
      handState = "open";
      sendStatus("opened");
    } else if (command == "CLOSE") {
      moveServo(CLOSED_ANGLE);
      handState = "closed";
      delay(250);
      sendStatus("closed");
    } else if (command == "STATUS") {
      sendStatus("status");
    } else {
      sendError("unknown_command");
    }
  }
}

void moveServo(int targetAngle) {
  if (targetAngle > currentAngle) {
    for (int angle = currentAngle; angle <= targetAngle; angle++) {
      driveServo.write(angle);
      delay(STEP_DELAY);
    }
  } else {
    for (int angle = currentAngle; angle >= targetAngle; angle--) {
      driveServo.write(angle);
      delay(STEP_DELAY);
    }
  }
  currentAngle = targetAngle;
}

bool isObjectDetected() {
  return digitalRead(BUTTON_PIN) == LOW;
}

void sendStatus(String eventName) {
  bool detected = isObjectDetected();

  Serial.print("{\"ok\":true,");
  Serial.print("\"event\":\"");
  Serial.print(eventName);
  Serial.print("\",");
  Serial.print("\"hand\":\"");
  Serial.print(handState);
  Serial.print("\",");
  Serial.print("\"object\":\"");
  Serial.print(detected ? "yes" : "no");
  Serial.print("\",");
  Serial.print("\"sensor\":\"");
  Serial.print(detected ? "pressed" : "released");
  Serial.print("\",");
  Serial.print("\"message\":\"ok\"}");
  Serial.println();
}

void sendError(String errorName) {
  Serial.print("{\"ok\":false,\"message\":\"");
  Serial.print(errorName);
  Serial.println("\"}");
}
