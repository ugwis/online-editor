FROM nginx:1.13-alpine
ADD . /var/www/html/
RUN echo "\
worker_processes  1;\
\
events {\
	worker_connections 2048;\
}\
\
http {\
	server {\
		listen 80;\
		server_name localhost;\
		location / {\
			root /var/www/html/;\
			index index.html index.htm;\
		}\
		error_page 500 502 503 504 /50x.html;\
		location = /50x.html {\
			root html;\
		}\
	}\
}" > /etc/nginx/nginx.conf
