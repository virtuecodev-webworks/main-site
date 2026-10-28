$ErrorActionPreference = "Stop"
$ffmpeg = "C:\Users\Dr Bankole\.local\bin\ffmpeg.exe"
$work = "public/work"

Write-Host "Creating 30s brand showreel with audio..."

# 1. Generate 30s ambient soundbed (48kHz stereo AAC)
$audio = "$env:TEMP/ambient-soundbed.m4a"
& $ffmpeg -y -f lavfi -i "aevalsrc=0.09*sin(2*PI*55*t)+0.06*sin(2*PI*110*t)+0.04*sin(2*PI*220*t)+0.02*sin(2*PI*330*t):s=48000:d=30" `
  -af "lowpass=f=600,afade=t=in:ss=0:d=2,afade=t=out:st=28:d=2" `
  -c:a aac -b:a 160k $audio

# 2. Render each of the 6 scenes as 5-second 1080p MP4 clips
$scenes = @(
  @{ img="$work/aurum-hero.jpg"; t1="VIRTUE & CO. WEBWORKS"; t2="SENIOR DIGITAL ARCHITECTURE & ENGINEERING" },
  @{ img="$work/finery-hero.jpg"; t1="MAISON FINERY PARIS"; t2="PARISIAN LUXURY READY-TO-WEAR COMMERCE" },
  @{ img="$work/meridian-hero.jpg"; t1="THE MERIDIAN REVIEW"; t2="GLOBAL JOURNALISM · PERSISTENT AUDIO ESSAYS" },
  @{ img="$work/northline-hero.jpg"; t1="NORTHLINE ARCHITECTURE"; t2="MODULAR NORDIC PREFAB & 3D CONFIGURATOR" },
  @{ img="$work/kinetix-hero.jpg"; t1="KINETIX AI CLOUD"; t2="BARE-METAL NVIDIA B200 GPU CLUSTERS" },
  @{ img="$work/solace-hero.jpg"; t1="MAKE. EVERY WEBSITE. COUNT."; t2="VIRTUECOWEBWORKS.SOLUTIONS · START A PROJECT" }
)

$clipFiles = @()
for ($i = 0; $i -lt $scenes.Count; $i++) {
  $sc = $scenes[$i]
  $clipOut = "$env:TEMP/clip_$i.mp4"
  $clipFiles += "file '$clipOut'"
  
  $t1 = $sc.t1
  $t2 = $sc.t2
  
  & $ffmpeg -y -loop 1 -t 5 -i $sc.img `
    -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,eq=contrast=1.12:brightness=-0.06:saturation=1.05,drawbox=y=0:color=black@0.4:width=iw:height=ih:t=fill,drawtext=text='$t1':fontsize=56:fontcolor=white:x=(w-text_w)/2:y=h*0.42:enable='between(t,0.3,4.8)',drawtext=text='$t2':fontsize=22:fontcolor=0xDCAA28:x=(w-text_w)/2:y=h*0.52:enable='between(t,0.6,4.8)',fade=t=in:st=0:d=0.5,fade=t=out:st=4.5:d=0.5" `
    -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p -r 30 `
    $clipOut
}

$concatList = "$env:TEMP/concat-list.txt"
$clipFiles -join "`n" | Set-Content -Path $concatList -Encoding Ascii

# 3. Concatenate all 6 clips + mux ambient audio
$finalReel = "public/media/brand-intro-v2.mp4"
& $ffmpeg -y -f concat -safe 0 -i $concatList -i $audio `
  -c:v copy -c:a aac -shortest `
  $finalReel

Write-Host "Created 30s reel: $finalReel"

# 4. Create optimized 8s hero ambient video loop
$heroLoop = "public/media/hero-loop.mp4"
& $ffmpeg -y -loop 1 -t 8 -i "$work/aurum-hero.jpg" `
  -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,eq=contrast=1.15:brightness=-0.08:saturation=0.95" `
  -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -r 30 -an `
  $heroLoop

Write-Host "Created 8s hero loop: $heroLoop"

# Clean up temps
Remove-Item $audio, $concatList -ErrorAction SilentlyContinue
for ($i = 0; $i -lt $scenes.Count; $i++) {
  Remove-Item "$env:TEMP/clip_$i.mp4" -ErrorAction SilentlyContinue
}
