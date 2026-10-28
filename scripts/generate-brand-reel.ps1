# Generate 30-second cinematic brand showreel for Virtue & Co. Webworks using ffmpeg
$ErrorActionPreference = "Stop"

$ffmpeg = "C:\Users\Dr Bankole\.local\bin\ffmpeg.exe"
if (-not (Test-Path $ffmpeg)) {
    $ffmpeg = (Get-Command ffmpeg).Source
}

Write-Host "Using ffmpeg: $ffmpeg"

$outDir = "public/media"
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

$workDir = "public/work"
$img1 = "$workDir/aurum-hero.jpg"
$img2 = "$workDir/finery-hero.jpg"
$img3 = "$workDir/meridian-hero.jpg"
$img4 = "$workDir/northline-hero.jpg"
$img5 = "$workDir/kinetix-hero.jpg"
$img6 = "$workDir/solace-hero.jpg"

# 1. Create a 30-second ambient soundbed: warm low drone + gentle harmonic chords + soft stereo shimmer
$audioPath = "$env:TEMP/virtue-ambient.wav"
& $ffmpeg -y -f lavfi -i "aevalsrc=0.12*sin(2*PI*55*t)+0.08*sin(2*PI*110*t)+0.05*sin(2*PI*165*t)+0.04*sin(2*PI*220*t)+0.02*sin(2*PI*330*t)+0.01*sin(2*PI*440*t):s=48000:d=30" `
  -af "lowpass=f=850,afade=t=in:ss=0:d=2.5,afade=t=out:st=27.5:d=2.5,volume=0.85" `
  $audioPath

# 2. Build 30-second showreel with 6 5-second cinematic scenes:
# Scene 1 (0-5s): Aurum - Corporate Treasury & Private Banking
# Scene 2 (5-10s): Maison Finery - Paris Luxury Flagship Store
# Scene 3 (10-15s): The Meridian Review - Global Journalism & Audio Press
# Scene 4 (15-20s): Northline - Modular Architectural Prefab Cabins
# Scene 5 (20-25s): Kinetix - AI GPU Clusters & Live Inference Cloud
# Scene 6 (25-30s): Solace - Preventative Longevity & Resolution

$filterComplex = @"
[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0006,1.1)':d=150:s=1920x1080:fps=30,drawtext=text='VIRTUE & CO. WEBWORKS':fontsize=64:fontcolor=white:x=(w-text_w)/2:y=h*0.42:enable='between(t,0.5,4.8)',drawtext=text='DIGITAL ARCHITECTURE & HIGH-GROWTH ENGINEERING':fontsize=24:fontcolor=0xDCAA28:x=(w-text_w)/2:y=h*0.52:enable='between(t,1.0,4.8)',fade=t=in:st=0:d=0.8,fade=t=out:st=4.2:d=0.8[v0];
[1:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0006,1.1)':d=150:s=1920x1080:fps=30,drawtext=text='AURUM PRIVATE TREASURY':fontsize=56:fontcolor=white:x=(w-text_w)/2:y=h*0.42:enable='between(t,0.5,4.8)',drawtext=text='CORPORATE BANKING · LIVE T-BILL VAULTS · VISA INFINITE':fontsize=22:fontcolor=0xDCAA28:x=(w-text_w)/2:y=h*0.52:enable='between(t,0.8,4.8)',fade=t=in:st=0:d=0.8,fade=t=out:st=4.2:d=0.8[v1];
[2:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0006,1.1)':d=150:s=1920x1080:fps=30,drawtext=text='MAISON FINERY PARIS':fontsize=56:fontcolor=white:x=(w-text_w)/2:y=h*0.42:enable='between(t,0.5,4.8)',drawtext=text='LUXURY COMMERCE · MULTI-CURRENCY · DHL EXPRESS':fontsize=22:fontcolor=0xDCAA28:x=(w-text_w)/2:y=h*0.52:enable='between(t,0.8,4.8)',fade=t=in:st=0:d=0.8,fade=t=out:st=4.2:d=0.8[v2];
[3:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0006,1.1)':d=150:s=1920x1080:fps=30,drawtext=text='NORTHLINE ARCHITECTURAL PREFAB':fontsize=54:fontcolor=white:x=(w-text_w)/2:y=h*0.42:enable='between(t,0.5,4.8)',drawtext=text='TIMBER RESIDENCES · INTERACTIVE 3D CONFIGURATOR':fontsize=22:fontcolor=0xDCAA28:x=(w-text_w)/2:y=h*0.52:enable='between(t,0.8,4.8)',fade=t=in:st=0:d=0.8,fade=t=out:st=4.2:d=0.8[v3];
[4:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0006,1.1)':d=150:s=1920x1080:fps=30,drawtext=text='KINETIX AI CLOUD':fontsize=56:fontcolor=white:x=(w-text_w)/2:y=h*0.42:enable='between(t,0.5,4.8)',drawtext=text='BARE-METAL NVIDIA B200 CLUSTERS · SUB-20MS INFERENCE':fontsize=22:fontcolor=0xDCAA28:x=(w-text_w)/2:y=h*0.52:enable='between(t,0.8,4.8)',fade=t=in:st=0:d=0.8,fade=t=out:st=4.2:d=0.8[v4];
[5:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0006,1.1)':d=150:s=1920x1080:fps=30,drawtext=text='MAKE. EVERY WEBSITE. COUNT.':fontsize=62:fontcolor=white:x=(w-text_w)/2:y=h*0.42:enable='between(t,0.5,4.8)',drawtext=text='VIRTUECOWEBWORKS.SOLUTIONS · START A PROJECT':fontsize=22:fontcolor=0xDCAA28:x=(w-text_w)/2:y=h*0.52:enable='between(t,0.8,4.8)',fade=t=in:st=0:d=0.8,fade=t=out:st=4.2:d=0.8[v5];
[v0][v1][v2][v3][v4][v5]concat=n=6:v=1:a=0[vout]
"@

$outputReel = "public/media/brand-intro-v2.mp4"

& $ffmpeg -y `
  -loop 1 -t 5 -i $img1 `
  -loop 1 -t 5 -i $img2 `
  -loop 1 -t 5 -i $img3 `
  -loop 1 -t 5 -i $img4 `
  -loop 1 -t 5 -i $img5 `
  -loop 1 -t 5 -i $img6 `
  -i $audioPath `
  -filter_complex $filterComplex `
  -map "[vout]" -map 6:a `
  -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p `
  -c:a aac -b:a 192k `
  -shortest `
  $outputReel

Write-Host "Generated 30-second studio showreel: $outputReel"

# 3. Also generate an updated seamless 8-second hero ambient loop
$heroLoopOut = "public/media/hero-loop.mp4"
& $ffmpeg -y `
  -loop 1 -t 8 -i $img1 `
  -filter_complex "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0008,1.14)':d=240:s=1920x1080:fps=30,eq=contrast=1.15:brightness=-0.08:saturation=0.9" `
  -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -an `
  $heroLoopOut

Write-Host "Generated hero ambient loop: $heroLoopOut"
Remove-Item $audioPath -ErrorAction SilentlyContinue
