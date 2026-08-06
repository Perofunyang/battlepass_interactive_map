import os
from PIL import Image

# 설정값
TARGET_DIR = "./assets/previews"  # 최상위 assets 폴더
#EXCLUDE_DIRS = ["maps"]  # 제외할 폴더 (지도는 원본 해상도 보존!)
MAX_WIDTH = 1000  # 마커 스샷 최대 너비 (1000px)
QUALITY = 80  # WebP 압축 품질 (80%)


def convert_and_compress(directory):
    processed_count = 0
    converted_count = 0
    skipped_count = 0

    for root, dirs, files in os.walk(directory):
        # maps 폴더는 탐색에서 완전 제외
        #dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for file in files:
            ext = os.path.splitext(file)[1].lower()

            if ext in [".png", ".jpg", ".jpeg", ".webp"]:
                file_path = os.path.join(root, file)

                try:
                    with Image.open(file_path) as img:
                        width, height = img.size

                        # ★ [핵심 스킵 조건] 이미 .webp 이고 너비도 1000px 이하이면 바로 생략!
                        if ext == ".webp" and width <= MAX_WIDTH:
                            print(
                                f"⏭️ [생략] 이미 완벽한 WebP 파일입니다: {file} ({width}px)"
                            )
                            skipped_count += 1
                            continue

                        # 1. 너비가 1000px 초과 시 리사이징
                        if width > MAX_WIDTH:
                            new_height = int(height * (MAX_WIDTH / width))
                            img = img.resize(
                                (MAX_WIDTH, new_height), Image.Resampling.LANCZOS
                            )
                            print(
                                f"✂️ [리사이즈] {file}: {width}px ➔ {MAX_WIDTH}px"
                            )

                        # 2. WebP 파일 경로 설정
                        file_name_without_ext = os.path.splitext(file)[0]
                        webp_file_path = os.path.join(
                            root, f"{file_name_without_ext}.webp"
                        )

                        # 3. WebP 저장
                        img.save(webp_file_path, "WEBP", quality=QUALITY)

                        # 4. 기존 파일이 JPG/PNG였다면 삭제하여 webp만 남김
                        if ext != ".webp":
                            os.remove(file_path)
                            print(
                                f"🔄 [WebP 변환 완료] {file} ➔ {file_name_without_ext}.webp (기존 원본 삭제)"
                            )
                            converted_count += 1
                        else:
                            print(
                                f"🛠️ [1000px 초과분의 WebP 리사이즈 완료] {file}"
                            )

                        processed_count += 1

                except Exception as e:
                    print(f"❌ [오류 발생] {file_path}: {e}")

    print("\n==================================================")
    print(f"✨ 작업 결과 요약:")
    print(f" - 이미 완벽해서 생략(스킵)된 파일: {skipped_count}개")
    print(f" - 신규 WebP로 변환된 파일: {converted_count}개")
    print(
        f" - 1000px 초과로 축소된 WebP 파일: {processed_count - converted_count}개"
    )
    print("==================================================")


if __name__ == "__main__":
    convert_and_compress(TARGET_DIR)