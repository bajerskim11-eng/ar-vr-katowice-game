# Hanys -> 3D GLB pipeline for Google Colab / NVIDIA GPU
# Run this on a GPU runtime. TripoSR needs ~6GB VRAM for one image.
import os, subprocess, urllib.request

IMAGE_URL='https://cdn.shopify.com/s/files/1/1019/1903/1622/files/hanys.jpg?v=1787742427'
ROOT='/content/hanys-3d'
os.makedirs(ROOT,exist_ok=True)
img=f'{ROOT}/hanys.jpg'
urllib.request.urlretrieve(IMAGE_URL,img)

if not os.path.exists('/content/TripoSR'):
    subprocess.run(['git','clone','https://github.com/VAST-AI-Research/TripoSR.git','/content/TripoSR'],check=True)
subprocess.run(['pip','install','-q','-r','/content/TripoSR/requirements.txt'],check=True)
subprocess.run(['python','/content/TripoSR/run.py',img,'--output-dir',f'{ROOT}/output','--bake-texture'],check=True)
print('DONE:',f'{ROOT}/output')
