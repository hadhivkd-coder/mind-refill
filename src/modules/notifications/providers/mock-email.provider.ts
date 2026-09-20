import {
  EmailProvider,
  SendEmailInput,
  SendEmailResult,
} from "./email-provider.interface";
import crypto from "crypto";

export class MockEmailProvider implements EmailProvider {
  async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    const messageId = `msg_${crypto.randomBytes(8).toString("hex")}`;
    
    // In test and dev environments, simulate successful delivery
    return {
      messageId,
      status: "SENT",
    };
  }
}
