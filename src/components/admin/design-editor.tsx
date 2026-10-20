"use client";

import * as React from "react";
import { RotateCcw, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, fieldBase } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VirtueSpinner } from "@/components/brand/virtue-spinner";
import { useRouter } from "@/i18n/navigation";
import { resetDesign, saveTheme } from "@/lib/actions/design";
import { IDLE_STATE } from "@/lib/actions/state";
import { fontFaceCss } from "@/lib/design/css";
import {
  GOOGLE_FONTS,
  googleFontHref,
  googleFontsInUse,
  requestableWeights,
} from "@/lib/design/fonts";
import { designErrorKey } from "@/lib/design/messages";
import {
  FLIP_MIN_DISTANCE,
  LABEL_COMFORT,
  LABEL_MINIMUM,
  accentMetrics,
} from "@/lib/design/palette";
import {
  BRAND_FONT_BODY,
  BRAND_FONT_DISPLAY,
  DEFAULT_DESIGN,
  FONTS_BUCKET,
  MAX_RADIUS,
  MIN_RADIUS,
  clampRadius,
  isBrandFont,
  isHex,
  type InstalledFont,
  type SiteDesign,
} from "@/lib/design/tokens";
import { publicStorageUrl } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";
import { DesignPreview } from "./design-preview";
import { FontLibrary } from "./font-library";

const GOOGLE_BODY = GOOGLE_FONTS.filter(
  (font) => font.use !== "display" && font.family !== BRAND_FONT_BODY,
);
const GOOGLE_DISPLAY = GOOGLE_FONTS.filter(
  (font) => font.use !== "body" && font.family !== BRAND_FONT_BODY,
);

/** Which band a measured contrast ratio falls into. */
function contrastBand(ratio: number): "good" | "workable" | "low" {
  if (ratio >= LABEL_COMFORT) return "good";
  if (ratio >= LABEL_MINIMUM) return "workable";
  return "low";
}

/** Which band a measured colour distance falls into. */
function distanceBand(distance: number): "good" | "workable" | "low" {
  if (distance >= FLIP_MIN_DISTANCE * 1.5) return "good";
  if (distance >= FLIP_MIN_DISTANCE) return "workable";
  return "low";
}

const BAND_CLASS = {
  good: "text-emerald-600 dark:text-emerald-400",
  workable: "text-gold-700",
  low: "text-destructive",
} as const;

/**
 * The design editor.
 *
 * A single form for the six values that define the theme, plus the font library.
 * Everything is drafted locally first, so the preview and the contrast readout
 * update as the admin types and nothing reaches the database until they save.
 *
 * The preview is built from the same derivation the server uses, so a
 * combination that reads badly here reads badly on the site.
 */
export function DesignEditor({ design }: { design: SiteDesign }) {
  const t = useTranslations("Admin.design");
  const tErrors = useTranslations("Admin.design.errors");
  const router = useRouter();

  const [draft, setDraft] = React.useState<SiteDesign>(design);
  const [state, action, pending] = React.useActionState(saveTheme, IDLE_STATE);
  const [resetting, setResetting] = React.useState(false);
  const handled = React.useRef<unknown>(null);

  React.useEffect(() => {
    if (handled.current === state || state.status === "idle") return;
    handled.current = state;

    if (state.status === "success") {
      toast.success(t("saved.saved"));
      router.refresh();
      return;
    }

    toast.error(tErrors(designErrorKey(state.message)));
  }, [state, router, t, tErrors]);

  const metrics = React.useMemo(() => accentMetrics(draft), [draft]);
  const previewHref = googleFontHref(googleFontsInUse(draft));
  const previewFaces = fontFaceCss(draft, (path) =>
    publicStorageUrl(FONTS_BUCKET, path),
  );
  const uploads = draft.fonts.filter((font) => font.kind === "upload");
  const fieldErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  function update<K extends keyof SiteDesign>(key: K, value: SiteDesign[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  /**
   * Choosing a Google family installs it on the spot.
   *
   * Without this the preview could not load a face the server does not yet know
   * about, and the admin would have to save before seeing what they picked.
   */
  function selectFont(slot: "body" | "display", family: string) {
    setDraft((current) => {
      const known = current.fonts.some((font) => font.family === family);
      const fonts =
        isBrandFont(family) || known
          ? current.fonts
          : [
              ...current.fonts,
              {
                family,
                kind: "google" as const,
                path: null,
                weights: requestableWeights(family),
              },
            ];

      return slot === "body"
        ? { ...current, fonts, fontBody: family }
        : { ...current, fonts, fontDisplay: family };
    });
  }

  function installFont(font: InstalledFont, slot: "body" | "display") {
    setDraft((current) => ({
      ...current,
      fonts: [
        ...current.fonts.filter((entry) => entry.family !== font.family),
        font,
      ],
      ...(slot === "body"
        ? { fontBody: font.family }
        : { fontDisplay: font.family }),
    }));
  }

  function uninstallFont(family: string) {
    setDraft((current) => ({
      ...current,
      fonts: current.fonts.filter((entry) => entry.family !== family),
      fontBody:
        current.fontBody === family ? BRAND_FONT_BODY : current.fontBody,
      fontDisplay:
        current.fontDisplay === family
          ? BRAND_FONT_DISPLAY
          : current.fontDisplay,
    }));
  }

  async function handleReset() {
    setResetting(true);

    try {
      const result = await resetDesign(IDLE_STATE, new FormData());

      if (result.status === "error") {
        toast.error(tErrors(designErrorKey(result.message)));
        return;
      }

      // The files stay in the library; only the choices go back to brand.
      setDraft({ ...DEFAULT_DESIGN, fonts: uploads });
      toast.success(t("saved.reset"));
      router.refresh();
    } catch {
      toast.error(tErrors("saveFailed"));
    } finally {
      setResetting(false);
    }
  }

  return (
    <>
      {/*
       * Candidate faces for the preview. `precedence` hoists the stylesheet into
       * `<head>` and deduplicates it, and it is only requested for families the
       * draft actually uses.
       */}
      {previewHref ? (
        <link rel="stylesheet" href={previewHref} precedence="vcw-fonts" />
      ) : null}
      {previewFaces ? (
        <style dangerouslySetInnerHTML={{ __html: previewFaces }} />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/*
          The font library is a sibling of the theme form, not a child of it. Its
          own panel is a `<form>`, and a form inside a form is invalid HTML: the
          browser's parser drops the inner one, the markup then stops matching
          what React rendered, and hydration fails on this page. Keeping them
          apart also means the upload form's own submit handler is the one that
          runs when a font is installed.
        */}
        <div className="flex flex-col gap-6">
          <form action={action} className="flex flex-col gap-6">
            <section className="surface flex flex-col gap-5 p-6">
              <header>
                <h2 className="text-base font-semibold">{t("theme.title")}</h2>
                <p className="mt-1 max-w-prose text-[13px] leading-relaxed text-muted-foreground">
                  {t("theme.hint")}
                </p>
              </header>

              <ColorField
                id="accent"
                label={t("accent")}
                hint={t("accentHint")}
                value={draft.accent}
                error={fieldErrors.accent ? tErrors("format") : undefined}
                onChange={(value) => update("accent", value)}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <ColorField
                  id="lightBackground"
                  label={t("lightBackground")}
                  value={draft.lightBackground}
                  error={
                    fieldErrors.lightBackground ? tErrors("format") : undefined
                  }
                  onChange={(value) => update("lightBackground", value)}
                />
                <ColorField
                  id="lightSurface"
                  label={t("lightSurface")}
                  value={draft.lightSurface}
                  error={
                    fieldErrors.lightSurface ? tErrors("format") : undefined
                  }
                  onChange={(value) => update("lightSurface", value)}
                />
                <ColorField
                  id="darkBackground"
                  label={t("darkBackground")}
                  value={draft.darkBackground}
                  error={
                    fieldErrors.darkBackground ? tErrors("format") : undefined
                  }
                  onChange={(value) => update("darkBackground", value)}
                />
                <ColorField
                  id="darkSurface"
                  label={t("darkSurface")}
                  value={draft.darkSurface}
                  error={
                    fieldErrors.darkSurface ? tErrors("format") : undefined
                  }
                  onChange={(value) => update("darkSurface", value)}
                />
              </div>

              <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                {t("surfaceHint")}
              </p>

              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <Label htmlFor="radius">{t("radius")}</Label>
                  <span className="font-mono text-[12.5px] text-muted-foreground">
                    {draft.radius}px
                  </span>
                </div>
                <input
                  id="radius"
                  name="radius"
                  type="range"
                  min={MIN_RADIUS}
                  max={MAX_RADIUS}
                  step={1}
                  value={draft.radius}
                  onChange={(event) =>
                    update("radius", clampRadius(event.target.value))
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none focus-visible:ring-3 focus-visible:ring-gold-500/25"
                />
                <p className="text-[11.5px] text-muted-foreground">
                  {t("radiusHint")}
                </p>
              </div>
            </section>

            <section className="surface flex flex-col gap-5 p-6">
              <header>
                <h2 className="text-base font-semibold">
                  {t("typography.title")}
                </h2>
                <p className="mt-1 max-w-prose text-[13px] leading-relaxed text-muted-foreground">
                  {t("typography.hint")}
                </p>
              </header>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fontBody">{t("bodyFont")}</Label>
                  <select
                    id="fontBody"
                    name="fontBody"
                    className={cn(fieldBase, "h-11")}
                    value={draft.fontBody}
                    onChange={(event) => selectFont("body", event.target.value)}
                  >
                    <optgroup label={t("groupBrand")}>
                      <option value={BRAND_FONT_BODY}>{t("brandBody")}</option>
                    </optgroup>
                    {uploads.length ? (
                      <optgroup label={t("groupUploaded")}>
                        {uploads.map((font) => (
                          <option key={font.family} value={font.family}>
                            {font.family}
                          </option>
                        ))}
                      </optgroup>
                    ) : null}
                    <optgroup label={t("groupGoogle")}>
                      {GOOGLE_BODY.map((font) => (
                        <option key={font.family} value={font.family}>
                          {font.family}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <p className="text-[11.5px] text-muted-foreground">
                    {t("bodyFontHint")}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="fontDisplay">{t("displayFont")}</Label>
                  <select
                    id="fontDisplay"
                    name="fontDisplay"
                    className={cn(fieldBase, "h-11")}
                    value={draft.fontDisplay}
                    onChange={(event) =>
                      selectFont("display", event.target.value)
                    }
                  >
                    <optgroup label={t("groupBrand")}>
                      <option value={BRAND_FONT_DISPLAY}>
                        {t("brandDisplay")}
                      </option>
                      <option value={BRAND_FONT_BODY}>{t("brandBody")}</option>
                    </optgroup>
                    {uploads.length ? (
                      <optgroup label={t("groupUploaded")}>
                        {uploads.map((font) => (
                          <option key={font.family} value={font.family}>
                            {font.family}
                          </option>
                        ))}
                      </optgroup>
                    ) : null}
                    <optgroup label={t("groupGoogle")}>
                      {GOOGLE_DISPLAY.map((font) => (
                        <option key={font.family} value={font.family}>
                          {font.family}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <p className="text-[11.5px] text-muted-foreground">
                    {t("displayFontHint")}
                  </p>
                </div>
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={pending || resetting}>
                {pending ? (
                  <VirtueSpinner className="size-4" />
                ) : (
                  <Save aria-hidden />
                )}
                {pending ? t("saving") : t("save")}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={pending || resetting}
                onClick={handleReset}
              >
                {resetting ? (
                  <VirtueSpinner className="size-4" />
                ) : (
                  <RotateCcw aria-hidden />
                )}
                {t("reset")}
              </Button>
            </div>
            <p className="-mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
              {t("resetHint")}
            </p>
          </form>

          <section className="surface flex flex-col gap-5 p-6">
            <header>
              <h2 className="text-base font-semibold">{t("library.title")}</h2>
              <p className="mt-1 max-w-prose text-[13px] leading-relaxed text-muted-foreground">
                {t("library.hint")}
              </p>
            </header>

            <FontLibrary
              design={draft}
              onInstalled={installFont}
              onRemoved={uninstallFont}
            />
          </section>
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-6 xl:self-start">
          <div className="surface flex flex-col gap-4 p-6">
            <div>
              <h2 className="text-base font-semibold">{t("contrast.title")}</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {t("contrast.hint")}
              </p>
            </div>

            <dl className="flex flex-col gap-2.5">
              <Readout
                label={t("contrast.lightLabel")}
                value={metrics.lightLabel}
                note={t("contrast.buttonNote")}
                kind="contrast"
              />
              <Readout
                label={t("contrast.darkLabel")}
                value={metrics.darkLabel}
                note={t("contrast.buttonNote")}
                kind="contrast"
              />
              <Readout
                label={t("contrast.lightFlip")}
                value={metrics.lightFlip}
                note={t("contrast.flipNote")}
                kind="distance"
              />
              <Readout
                label={t("contrast.darkFlip")}
                value={metrics.darkFlip}
                note={t("contrast.flipNote")}
                kind="distance"
              />
            </dl>

            <p className="border-t border-border pt-4 text-[11.5px] leading-relaxed text-muted-foreground">
              {t("contrast.footnote")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              {t("contrast.lightPreview")}
            </p>
            <DesignPreview design={draft} mode="light" />
            <p className="mt-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              {t("contrast.darkPreview")}
            </p>
            <DesignPreview design={draft} mode="dark" />
          </div>
        </aside>
      </div>
    </>
  );
}

function Readout({
  label,
  value,
  note,
  kind,
}: {
  label: string;
  value: number;
  note: string;
  kind: "contrast" | "distance";
}) {
  const t = useTranslations("Admin.design.contrast");
  const level = kind === "contrast" ? contrastBand(value) : distanceBand(value);

  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <dt className="text-[13px] text-foreground">{label}</dt>
        <p className="text-[11px] text-muted-foreground">{note}</p>
      </div>
      <dd
        className={cn(
          "shrink-0 text-right font-mono text-[12.5px] font-medium",
          BAND_CLASS[level],
        )}
      >
        {kind === "contrast" ? `${value.toFixed(2)}:1` : `${value.toFixed(0)}%`}
        <span className="sr-only"> {t(level)}</span>
      </dd>
    </div>
  );
}

/**
 * A colour picker and its hex value.
 *
 * Both controls write to the same draft value; only the text input carries the
 * field name, so what is submitted is whatever the admin actually typed and the
 * action is what refuses a malformed value.
 */
function ColorField({
  id,
  label,
  hint,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const valid = isHex(value);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`${id}-hex`}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={valid ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="size-11 shrink-0 cursor-pointer rounded-xl border border-input bg-background p-1.5"
        />
        <Input
          id={`${id}-hex`}
          name={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          autoComplete="off"
          maxLength={16}
          aria-invalid={!valid}
          className="font-mono text-[13px]"
        />
      </div>
      {error ? (
        <p className="text-[11.5px] text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-[11.5px] leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
