import * as React from 'react'
import {
  Shell,
  DigitBoxes,
  SecurityNotice,
  CardHeadline,
  CardSubtext,
  Divider,
} from './base/shell'
import { IMAGE_AURUM, TEXT_MUTED_DARK } from './base/tokens'

export interface SignupOtpProps {
  code: string
  name?: string
}

export function SignupOtpEmail({ code, name }: SignupOtpProps) {
  const first = name?.split(' ')[0] ?? 'there'

  return (
    <Shell
      preheader={`Your 6-digit verification code is: ${code}`}
      eyebrow="Verification"
      heroImageUrl={IMAGE_AURUM}
      heroImageAlt="Virtue & Co. Webworks — Client Workspace"
    >
      <CardHeadline>Your verification code.</CardHeadline>
      <CardSubtext>
        Hi {first}, enter this 6-digit code in your browser to activate your client workspace.
      </CardSubtext>

      <DigitBoxes code={code} />

      <div style={{ textAlign: 'center', fontSize: 12.5, color: TEXT_MUTED_DARK, margin: '10px 0 20px', fontWeight: 500 }}>
        Code is valid for 60 minutes · Never share this code with anyone
      </div>

      <SecurityNotice />

      <Divider />

      <div style={{ fontSize: 12, color: TEXT_MUTED_DARK, textAlign: 'center', lineHeight: 1.6 }}>
        If you did not initiate this request, you can safely ignore this email.
      </div>
    </Shell>
  )
}

export default SignupOtpEmail
