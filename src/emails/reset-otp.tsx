/**
 * Template 4 — Password Reset Verification Code (6-Digit OTP)
 * Matched 1:1 to the user reference screenshot design.
 */
import * as React from 'react'
import {
  Shell,
  DigitBoxes,
  SecurityNotice,
  SecurityPill,
  CardHeadline,
  CardSubtext,
  AutomatedMessageNote,
} from './base/shell'

export interface ResetOtpProps {
  code: string
  name?: string
}

export function ResetOtpEmail({ code }: ResetOtpProps) {
  return (
    <Shell preheader={`Your Password Reset verification Code is: ${code}`}>
      <CardHeadline>Reset Password Verification Code</CardHeadline>

      <DigitBoxes code={code} />

      <CardSubtext>Don&apos;t share this code to anyone!</CardSubtext>

      <SecurityNotice actionText="ignore this email and keep your current password" />

      <AutomatedMessageNote />

      <SecurityPill />
    </Shell>
  )
}

export default ResetOtpEmail
