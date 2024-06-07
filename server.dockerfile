# See https://stackoverflow.com/a/54763270/14748231

FROM python:3.11

WORKDIR /solution

RUN apt update
RUN apt install --no-install-recommends -yq poppler-utils
RUN pip install poetry

COPY projects/server projects/server

WORKDIR /solution/projects/server

RUN poetry config virtualenvs.create false
RUN poetry install --without=dev --no-interaction --no-ansi --no-root

ENV PIP_DEFAULT_TIMEOUT 600
RUN poetry install --without=dev --no-interaction --no-ansi

CMD make run ORWYNN_DEBUG=0 ORWYNN_ALLOW_CLEAN=0 ORWYNN_MODE=prod host=0.0.0.0 port=9151
