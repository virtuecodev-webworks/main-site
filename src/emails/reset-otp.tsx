import * as React from 'react'
import {
  Shell,
  DigitBoxes,
  SecurityNotice,
  CardHeadline,
  CardSubtext,
  Divider,
} from './base/shell'
import { IMAGE_BRAND_BANNER, TEXT_MUTED_DARK } from './base/tokens'

export interface ResetOtpProps {
  code: string
  name?: string
}

export function ResetOtpEmail({ code, name }: ResetOtpProps) {
  const first = name?.split(' ')[0] ?? 'there'

  return (
    <Shell
      preheader={`Your 6-digit password reset code is: ${code}`}
      eyebrow="Password Reset"
      heroImageUrl={IMAGE_BRAND_BANNER}
      heroImageAlt="Virtue & Co. Webworks"
    >
      <CardHeadline>Reset your password.</CardHeadline>
      <CardSubtext>
        Hi {first}, enter this 6-digit code in your browser to choose a new password.
      </CardSubtext>

      <DigitBoxes code={code} />

      <div style={{ textAlign: 'center', fontSize: 12.5, color: TEXT_MUTED_DARK, margin: '10px 0 20px', fontWeight: 500 }}>
        Code is valid for 60 minutes · Never share this code with anyone
      </div>

      <SecurityNotice actionText="ignore this email and keep your current password" />

      <Divider />

      <div style={{ fontSize: 12, color: TEXT_MUTED_DARK, textAlign: 'center', lineHeight: 1.6 }}>
        If you did not request a password reset, you can safely ignore this email.
      </div>
    </Shell>
  )
}

export default ResetOtpEmail
