
from flask import Flask, send_from_directory, make_response
import os

app = Flask(__name__)

# 현재 디렉토리를 루트로 설정
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route('/')
def serve_index():
    """메인 페이지(index.html)를 반환합니다."""
    return send_from_directory(ROOT_DIR, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """
    모든 정적 파일(tsx, ts, json, js 등)을 반환합니다.
    브라우저가 TypeScript 모듈을 자바스크립트로 인식하도록 MIME 타입을 처리합니다.
    """
    response = make_response(send_from_directory(ROOT_DIR, path))
    
    # 브라우저의 ESM 모듈 로딩을 위한 MIME 타입 수동 보정
    if path.endswith('.tsx') or path.endswith('.ts'):
        response.headers['Content-Type'] = 'application/javascript'
    elif path.endswith('.json'):
        response.headers['Content-Type'] = 'application/json'
    
    # 캐시 방지 설정 (배포 초기 단계에서 업데이트 반영을 위함)
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    
    return response

if __name__ == '__main__':
    print("--------------------------------------------------")
    print("그랜드썬 안전마스터 서버가 시작되었습니다.")
    print("접속 주소: http://localhost:8000")
    print("--------------------------------------------------")
    # 포트 8000번으로 서버 실행
    app.run(host='0.0.0.0', port=8000, debug=True)
