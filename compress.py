import os
import cv2
from PIL import Image, ImageSequence

# 설정값
TARGET_DIR = "./assets/previews"  # 대상 폴더
MAX_WIDTH = 1000  # 최대 너비 (1000px)
QUALITY = 80  # WebP 압축 품질 (80%)


def process_video_to_webp(file_path, webp_file_path, max_width, quality):
    """MP4 등 동영상 파일을 프레임별로 추출하여 움직이는 WebP로 변환하는 함수"""
    cap = cv2.VideoCapture(file_path)

    # 원본 동영상 FPS(초당 프레임 수) 추출 및 프레임당 재생시간(ms) 계산
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 24.0  # 기본값 예외 처리
    duration = int(1000 / fps)

    frames = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # OpenCV(BGR) ➔ Pillow(RGB) 색상 변환
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb_frame)

        # 너비가 1000px 초과 시 비율 유지 리사이즈
        w, h = pil_img.size
        if w > max_width:
            new_h = int(h * (max_width / w))
            pil_img = pil_img.resize(
                (max_width, new_h), Image.Resampling.LANCZOS
            )

        frames.append(pil_img)

    cap.release()

    # 프레임이 정상 추출되었으면 움직이는 WebP로 저장
    if frames:
        frames[0].save(
            webp_file_path,
            "WEBP",
            save_all=True,
            append_images=frames[1:],
            duration=duration,
            loop=0,  # 무한 반복
            quality=quality,
        )
        return len(frames)
    return 0


def convert_and_compress(directory):
    processed_count = 0
    converted_count = 0
    skipped_count = 0
    animated_count = 0
    video_count = 0

    # 지원 확장자 목록 (MP4, MOV, AVI 동영상 추가!)
    valid_image_exts = [".png", ".jpg", ".jpeg", ".webp", ".gif"]
    valid_video_exts = [".mp4", ".mov", ".avi", ".mkv"]

    for root, dirs, files in os.walk(directory):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            file_path = os.path.join(root, file)
            should_delete_original = False

            # 1. MP4 등 동영상 처리
            if ext in valid_video_exts:
                try:
                    file_name_without_ext = os.path.splitext(file)[0]
                    webp_file_path = os.path.join(
                        root, f"{file_name_without_ext}.webp"
                    )

                    frame_cnt = process_video_to_webp(
                        file_path, webp_file_path, MAX_WIDTH, QUALITY
                    )
                    if frame_cnt > 0:
                        video_count += 1
                        should_delete_original = True
                        processed_count += 1
                        print(
                            f"🎥 [동영상 ➔ WebP 변환 완료] {file} ({frame_cnt}개 프레임)"
                        )

                except Exception as e:
                    print(f"❌ [동영상 오류] {file_path}: {e}")

            # 2. 일반 이미지 및 GIF 처리
            elif ext in valid_image_exts:
                try:
                    with Image.open(file_path) as img:
                        width, height = img.size

                        # 이미 .webp이고 1000px 이하인 경우 스킵
                        if ext == ".webp" and width <= MAX_WIDTH:
                            skipped_count += 1
                            continue

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
                            durations = []

                            for frame in ImageSequence.Iterator(img):
                                f = frame.copy()
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
                                f"🎬 [GIF ➔ WebP 변환 완료] {file} ({img.n_frames}개 프레임)"
                            )

                        else:
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
                            should_delete_original = True

                        processed_count += 1

                except Exception as e:
                    print(f"❌ [이미지 오류] {file_path}: {e}")

            # 3. 원본 삭제 수행 (파일 접근 해제 후)
            if should_delete_original and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    converted_count += 1
                except Exception as e:
                    print(f"⚠️ [원본 삭제 실패] {file_path}: {e}")

    print("\n==================================================")
    print(f"✨ 작업 결과 요약:")
    print(f" - 스킵(생략)된 파일: {skipped_count}개")
    print(f" - 변환된 동영상(MP4 등): {video_count}개")
    print(f" - 변환된 GIF(움직이는 WebP): {animated_count}개")
    print(f" - 삭제된 원본 파일: {converted_count}개")
    print(f" - 총 처리된 파일: {processed_count}개")
    print("==================================================")


if __name__ == "__main__":
    convert_and_compress(TARGET_DIR)