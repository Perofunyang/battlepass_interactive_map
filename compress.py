import os
from PIL import Image

# 설정값
TARGET_DIR = "./assets/previews"  # 최상위 assets 폴더
#EXCLUDE_DIRS = ["maps", "category"]  # 제외할 폴더 (지도는 원본 해상도 보존!)
MAX_WIDTH = 1000  # 마커 스샷 최대 너비 (1000px)
QUALITY = 100  # WebP 압축 품질 (100%)


def convert_and_compress(directory):
    count = 0
    converted_count = 0

    for root, dirs, files in os.walk(directory):
        # [maps] 폴더는 탐색에서 완전 제외
        #dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for file in files:
            ext = os.path.splitext(file)[1].lower()

            # PNG, JPG, JPEG, WEBP 이미지 대상
            if ext in [".png", ".jpg", ".jpeg", ".webp"]:
                file_path = os.path.join(root, file)

                try:
                    with Image.open(file_path) as img:
                        width, height = img.size

                        # 1. 너비가 1000px 초과 시에만 리사이징
                        if width > MAX_WIDTH:
                            new_height = int(height * (MAX_WIDTH / width))
                            img = img.resize(
                                (MAX_WIDTH, new_height), Image.Resampling.LANCZOS
                            )
                            print(
                                f"✂️ [리사이즈] {file}: {width}px ➔ {MAX_WIDTH}px"
                            )

                        # 2. .webp 확장자로 저장 경로 생성
                        file_name_without_ext = os.path.splitext(file)[0]
                        webp_file_path = os.path.join(
                            root, f"{file_name_without_ext}.webp"
                        )

                        # 3. WebP 포맷으로 저장 (투명 배경 완벽 지원)
                        img.save(webp_file_path, "WEBP", quality=QUALITY)

                        # 4. 기존 파일이 JPG/PNG였다면 삭제하여 지저분하지 않게 webp만 남김
                        if ext != ".webp":
                            os.remove(file_path)
                            print(
                                f"🔄 [WebP 변환 완료] {file} ➔ {file_name_without_ext}.webp (기존 파일 삭제됨)"
                            )
                            converted_count += 1
                        else:
                            print(
                                f"✅ [WebP 최적화 완료] {file}: {width}px"
                            )

                        count += 1

                except Exception as e:
                    print(f"❌ [오류 발생] {file_path}: {e}")

    print("\n==================================================")
    print(
        f"✨ (maps 폴더 제외) 총 {count}개 처리 완료! (WebP로 신규 변환된 파일: {converted_count}개)"
    )
    print("==================================================")


if __name__ == "__main__":
    convert_and_compress(TARGET_DIR)