/**
 * Template 1 — Email Signup Confirmation (6-Digit OTP)
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

export interface SignupOtpProps {
  code: string
  name?: string
}

export function SignupOtpEmail({ code }: SignupOtpProps) {
  return (
    <Shell preheader={`Your Signup verification Code is: ${code}`} eyebrow="Security Verification">
      <CardHeadline>Your Signup verification Code</CardHeadline>

      <DigitBoxes code={code} />

      <CardSubtext>Don&apos;t share this code to anyone!</CardSubtext>

      <SecurityNotice />

      <AutomatedMessageNote />

      <SecurityPill />
    </Shell>
  )
}

export default SignupOtpEmail
