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

            # PNG, JPG, JPEG, WEBP, GIF 대상
            if ext in [".png", ".jpg", ".jpeg", ".webp", ".gif"]:
                file_path = os.path.join(root, file)

                try:
                    with Image.open(file_path) as img:
                        width, height = img.size

                        # 1. 스킵 조건: 이미 .webp 이고 1000px 이하이면 건드리지 않음 (움직이는 WebP 원본 100% 보존!)
                        if ext == ".webp" and width <= MAX_WIDTH:
                            print(
                                f"⏭️ [생략] 이미 완벽한 WebP 파일입니다: {file} ({width}px)"
                            )
                            skipped_count += 1
                            continue

                        file_name_without_ext = os.path.splitext(file)[0]
                        webp_file_path = os.path.join(
                            root, f"{file_name_without_ext}.webp"
                        )

                        # 2. 애니메이션(움직이는 GIF/WebP) 여부 감지
                        is_animated = (
                            getattr(img, "is_animated", False)
                            and img.n_frames > 1
                        )

                        if is_animated:
                            # [애니메이션 처리] 모든 프레임과 재생 시간(duration) 보존
                            duration = img.info.get("duration", 100)
                            loop = img.info.get("loop", 0)

                            frames = []
                            for frame in ImageSequence.Iterator(img):
                                f = frame.copy()
                                w, h = f.size
                                if w > MAX_WIDTH:
                                    new_h = int(h * (MAX_WIDTH / w))
                                    f = f.resize(
                                        (MAX_WIDTH, new_h),
                                        Image.Resampling.LANCZOS,
                                    )
                                frames.append(f)

                            # 모든 프레임을 묶어서 애니메이션 WebP로 저장
                            frames[0].save(
                                webp_file_path,
                                "WEBP",
                                save_all=True,
                                append_images=frames[1:],
                                duration=duration,
                                loop=loop,
                                quality=QUALITY,
                            )
                            animated_count += 1
                            print(
                                f"🎬 [움직이는 WebP 보존 완료] {file} ({img.n_frames}개 프레임 전체 리사이즈)"
                            )

                        else:
                            # [일반 정지 이미지 처리]
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

                        # 기존 파일이 JPG/PNG/GIF였다면 삭제하고 webp만 남김
                        if ext != ".webp":
                            os.remove(file_path)
                            converted_count += 1

                        processed_count += 1

                except Exception as e:
                    print(f"❌ [오류 발생] {file_path}: {e}")

    print("\n==================================================")
    print(f"✨ 작업 결과 요약:")
    print(f" - 스킵(생략)된 파일 (원본 완전 보존): {skipped_count}개")
    print(f" - 프레임 보존된 움직이는 WebP/GIF: {animated_count}개")
    print(f" - 신규 WebP로 변환/최적화된 파일: {processed_count}개")
    print("==================================================")


if __name__ == "__main__":
    convert_and_compress(TARGET_DIR)