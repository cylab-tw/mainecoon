FROM node:22

WORKDIR /app

RUN apt update && \
    apt-get install -y default-jre && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app/vendor && \
    cd /app/vendor && \
    curl -L https://sourceforge.net/projects/dcm4che/files/dcm4che3/5.33.0/dcm4che-5.33.0-bin.zip/download -o dcm4che.zip && \
    unzip dcm4che.zip -d /app/vendor && \
    rm dcm4che.zip

ENV PATH="/app/vendor/dcm4che-5.33.0/bin:$PATH"

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "app/server.js"]
