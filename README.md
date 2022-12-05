# Smaller ShadowPlay Files

small tool for **losslessly** encoding Nvidia shadowplay output files so that i won't fill my HDD with useless crap. Honestly i don't know what it removes but the video and audio quality does not suffer any downgrade (human perception). Also it maintains all the audio streams so if you have multiple audio tracks they won't be merged.

## Usage

```bash
sspf <-p <path>> [-w <maxWorkers>]
```

> Default `path` is `cwd`

> Default `maxWorkers` is `2`

## Super scuffed benchmark

**Specs:**

| Comp. | Name       | Value          |
| ----- | ---------- | -------------- |
| CPU   | i7-8700K   | 4.7GHz 6 Cores |
| GPU   | GTX 1080TI | 11GB           |
| RAM   | Hybrid     | 24GB @ 2133MHz |

First version (one file at the time)

```txt
5 files, 892MB in total, max nest level 3
892MB -> 188MB in 164s (2.73 minutes)

% of freed space:
Δ = 704MB
-> Δ / 892  = 0.789 = 78.9%
```

Second version (worker for each directory `-w`)

```txt
5 files, 892MB in total, max nest level 3
892MB -> 188MB in 92.6s (1.54 minutes)

% of freed space: 78.92%

% of gained time:
Δ = 164s - 92.6s = 71.4s
-> Δ / 164  = 0.435 = 43.5%
```
