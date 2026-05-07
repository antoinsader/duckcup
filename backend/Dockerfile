FROM python:3.11

ENV NUMBA_DISABLE_JIT=1

WORKDIR /app

COPY requirements.txt .
RUN python -m pip install --upgrade pip
RUN python -m venv /app/venv
RUN /app/venv/bin/pip install --upgrade pip
RUN /app/venv/bin/pip install -r requirements.txt
RUN /app/venv/bin/python -m spacy download en_core_web_md
ENV PATH="/app/venv/bin:$PATH"

COPY . .

RUN sed -i 's/\r//' entrypoint.sh && chmod +x entrypoint.sh

CMD ["sh", "entrypoint.sh"]
