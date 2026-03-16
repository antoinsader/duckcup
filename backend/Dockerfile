FROM python:3.11

ENV NUMBA_DISABLE_JIT=1

WORKDIR /app

COPY requirements.txt .
RUN python -m pip install --upgrade pip
RUN python -m spacy download en_core_web_md
RUN pip install -r requirements.txt

COPY . .

RUN chmod +x entrypoint.sh

CMD ["sh", "entrypoint.sh"]
