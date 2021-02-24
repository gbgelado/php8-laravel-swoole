FROM php:8.0-cli

ENV PHP_OPCACHE_VALIDATE_TIMESTAMPS="0" \
    PHP_OPCACHE_MAX_ACCELERATED_FILES="10000" \
    PHP_OPCACHE_MEMORY_CONSUMPTION="192" \
    PHP_OPCACHE_MAX_WASTED_PERCENTAGE="10"

WORKDIR /var/www

COPY . .

RUN apt-get update && apt-get install vim -y && \
    apt-get install inotify-tools -y && \
    apt-get install libcurl4-openssl-dev -y && \
    apt-get install supervisor -y && \
    apt-get install unzip -y && \
    apt-get install zlib1g-dev -y && \
    apt-get install openssl -y && \
    apt-get install libssl-dev -y && \
    apt-get install wget -y && \
    apt-get install git -y && \
    apt-get install procps -y && \
    apt-get install htop -y

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash
RUN apt-get install nodejs -y

RUN cd /tmp && git clone https://github.com/swoole/swoole-src.git && \
    cd /tmp/swoole-src && \
    git checkout v4.6.3 && \
    phpize && \
    ./configure  --enable-openssl && \
    make && \
    make install

RUN touch /usr/local/etc/php/conf.d/swoole.ini && \
    echo 'extension=swoole.so' > /usr/local/etc/php/conf.d/swoole.ini

RUN apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN chmod -R 755 /var/www/storage
RUN chmod -R 755 /var/www/bootstrap/cache

RUN npm install -g pm2 yarn
RUN yarn install

EXPOSE 1215

CMD ["/usr/bin/supervisord", "-n"]
