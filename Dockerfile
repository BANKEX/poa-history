FROM golang:latest
RUN mkdir /app
ADD . /app/
WORKDIR /app

RUN go get github.com/gin-gonic/gin

RUN go build -o main .

EXPOSE 7070
EXPOSE 27017

CMD ["/app/main"]