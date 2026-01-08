FROM python:3.10-slim

WORKDIR /app

RUN pip install runpod

COPY handler.py /app/handler.py

CMD ["python", "-u", "handler.py"]
