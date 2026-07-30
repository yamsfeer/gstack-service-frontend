FROM node:8.9.0-alpine

# 设置工作目录
WORKDIR /service-frontend

RUN set -e && \
        sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
                apk update && \
                apk add --no-cache \
                        tzdata \
                        make \
                        git \
                        nginx \
                        openrc \
                && \
                cp -r -f /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# 复制包定义文件到容器当前的工作目录
COPY package*.json ./

# 编译安装node项目，使用npm安装程序的所有依赖,利用taobao的npm源加速安装
# RUN npm install -g cnpm --registry=https://registry.npm.taobao.org && cnpm install --registry=https://registry.npm.taobao.org
RUN npm i --registry=https://registry.npmjs.org

# 复制所有项目文件到当前的工作目录
# 注意：使用 COPY 指令，源文件的各种元数据都会保留。比如读、写、执行权限、文件变更时间等
COPY . .

RUN npm run build:prod

RUN mkdir /www && \
   adduser -D -g 'www' www && \
   chown -R www:www /var/lib/nginx && \
   chown -R www:www /www && \
   cp ./deploy/nginx.conf /etc/nginx/nginx.conf && \
   mv ./dist/* /www/

# 将容器服务端口暴露出来
EXPOSE 80 443

#运行命令
CMD ["nginx", "-g", "daemon off;"]
