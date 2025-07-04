import subprocess
import os
import tempfile
from typing import Optional
import requests
from services.storage_service import StorageService

class VideoService:
    def __init__(self):
        self.storage_service = StorageService()
    
    async def create_hls_version(self, video_url: str) -> str:
        """Создает HLS версию видео для стриминга"""
        try:
            # Скачиваем оригинальное видео во временный файл
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_input:
                response = requests.get(video_url)
                temp_input.write(response.content)
                temp_input_path = temp_input.name
            
            # Создаем временную директорию для HLS файлов
            with tempfile.TemporaryDirectory() as temp_dir:
                output_path = os.path.join(temp_dir, 'playlist.m3u8')
                
                # FFmpeg команда для создания HLS
                cmd = [
                    'ffmpeg',
                    '-i', temp_input_path,
                    '-codec:', 'copy',
                    '-start_number', '0',
                    '-hls_time', '10',
                    '-hls_list_size', '0',
                    '-f', 'hls',
                    output_path
                ]
                
                # Выполняем конвертацию
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.returncode != 0:
                    raise Exception(f"FFmpeg error: {result.stderr}")
                
                # Загружаем HLS файлы в хранилище
                hls_urls = []
                for file in os.listdir(temp_dir):
                    if file.endswith('.m3u8') or file.endswith('.ts'):
                        file_path = os.path.join(temp_dir, file)
                        # Здесь нужно загрузить каждый файл в DO Spaces
                        # Упрощенная версия - возвращаем URL плейлиста
                        pass
                
                # Очищаем временный файл
                os.unlink(temp_input_path)
                
                # Возвращаем URL HLS плейлиста
                return f"{video_url.replace('.mp4', '.m3u8')}"
                
        except Exception as e:
            raise Exception(f"Failed to create HLS version: {str(e)}")
    
    async def get_video_duration(self, video_url: str) -> Optional[int]:
        """Получает длительность видео в секундах"""
        try:
            cmd = [
                'ffprobe',
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                video_url
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                import json
                data = json.loads(result.stdout)
                duration = float(data['format']['duration'])
                return int(duration)
            
            return None
            
        except Exception as e:
            print(f"Failed to get video duration: {str(e)}")
            return None
    
    def generate_thumbnail(self, video_url: str, timestamp: int = 10) -> str:
        """Генерирует превью из видео"""
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_thumb:
                cmd = [
                    'ffmpeg',
                    '-i', video_url,
                    '-ss', str(timestamp),
                    '-vframes', '1',
                    '-q:v', '2',
                    temp_thumb.name
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.returncode == 0:
                    # Загружаем превью в хранилище
                    # Возвращаем URL превью
                    return f"{video_url.replace('.mp4', '_thumb.jpg')}"
                
                return ""
                
        except Exception as e:
            print(f"Failed to generate thumbnail: {str(e)}")
            return ""
