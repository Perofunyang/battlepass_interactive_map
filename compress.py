import os
from PIL import Image, ImageSequence

# 설정값
TARGET_DIR = "./assets/previews"  # 최상위 assets 폴더
#EXCLUDE_DIRS = ["maps"]  # 제외할 폴더 (지도는 원본 보존!)
MAX_WIDTH = 1000  # 마커 스샷 최대 너비 (1000px)
QUALITY = 80  # WebP 압축 품질 (80%)


def convert_and_compress(directory):
    processed_count = 0
    converted_count = 0
    skipped_count = 0
    animated_count = 0

    for root, dirs, files in os.walk(directory):
        # maps 폴더 탐색 제외
        #dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for file in files:
            ext = os.path.splitext(file)[1].lower()

            if ext in [".png", ".jpg", ".jpeg", ".webp", ".gif"]:
                file_path = os.path.join(root, file)

                try:
                    with Image.open(file_path) as img:
                        width, height = img.size

                        # 스킵 조건: 이미 .webp 포맷이고 1000px 이하인 경우 (단, 새로 원본을 넣었을 때 처리되도록 설정)
                        if ext == ".webp" and width <= MAX_WIDTH:
                            print(
                                f"⏭️ [생략] 이미 완벽한 WebP 파일입니다: {file} ({width}px)"
                            )
                            skipped_count += 1
                            continue

                        # 애니메이션(움직이는 GIF/WebP) 감지
                        is_animated = (
                            getattr(img, "is_animated", False)
                            and img.n_frames > 1
                        )

                        file_name_without_ext = os.path.splitext(file)[0]
                        webp_file_path = os.path.join(
                            root, f"{file_name_without_ext}.webp"
                        )

                        if is_animated:
                            loop = img.info.get("loop", 0)

                            frames = []
                            durations = []  # ★ 각 프레임별 원본 재생 속도를 저장할 배열

                            for frame in ImageSequence.Iterator(img):
                                f = frame.copy()

                                # ★ 핵심: 프레임별 원본 재생 속도(ms) 개별 추출
                                frame_duration = frame.info.get("duration", 40)
                                durations.append(frame_duration)

                                w, h = f.size
                                if w > MAX_WIDTH:
                                    new_h = int(h * (MAX_WIDTH / w))
                                    f = f.resize(
                                        (MAX_WIDTH, new_h),
                                        Image.Resampling.LANCZOS,
                                    )
                                frames.append(f)

                            # ★ duration=durations 배열을 넘겨 원본 속도 100% 보존
                            frames[0].save(
                                webp_file_path,
                                "WEBP",
                                save_all=True,
                                append_images=frames[1:],
                                duration=durations,
                                loop=loop,
                                quality=QUALITY,
                            )
                            animated_count += 1
                            print(
                                f"🎬 [원본 속도 보존 완벽 변환] {file} ({img.n_frames}개 프레임)"
                            )

                        else:
                            # 정지 이미지 처리
                            if width > MAX_WIDTH:
                                new_height = int(height * (MAX_WIDTH / width))
                                img = img.resize(
                                    (MAX_WIDTH, new_height),
                                    Image.Resampling.LANCZOS,
                                )
                                print(
                                    f"✂️ [리사이즈] {file}: {width}px ➔ {MAX_WIDTH}px"
                                )

                            img.save(webp_file_path, "WEBP", quality=QUALITY)
                            print(
                                f"🖼️ [WebP 저장 완료] {file_name_without_ext}.webp"
                            )

                        if ext != ".webp":
                            os.remove(file_path)
                            converted_count += 1

                        processed_count += 1

                except Exception as e:
                    print(f"❌ [오류 발생] {file_path}: {e}")

    print("\n==================================================")
    print(f"✨ 작업 결과 요약:")
    print(f" - 스킵(생략)된 파일: {skipped_count}개")
    print(f" - 원본 속도로 변환된 움직이는 WebP/GIF: {animated_count}개")
    print(f" - 총 처리된 파일: {processed_count}개")
    print("==================================================")


if __name__ == "__main__":
    convert_and_compress(TARGET_DIR)