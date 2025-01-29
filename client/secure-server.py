from http.server import HTTPServer, SimpleHTTPRequestHandler
from ssl import PROTOCOL_TLS_SERVER, SSLContext

ssl_context = SSLContext(PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain("/etc/ssl/certs/programmeren9.cmgt.hr.nl.cert", "/etc/ssl/private/key-programmeren9.cmgt.hr.nl.pem")
server = HTTPServer(("0.0.0.0", 8888), SimpleHTTPRequestHandler)
server.socket = ssl_context.wrap_socket(server.socket, server_side=True)
server.serve_forever()

#!/usr/bin/env python3
# python3 update of https://gist.github.com/dergachev/7028596
# Create a basic certificate using openssl:
#     openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes
# Or to set CN, SAN and/or create a cert signed by your own root CA: https://thegreycorner.com/pentesting_stuff/writeups/selfsignedcert.html

#import http.server
#import ssl

#httpd = http.server.HTTPServer(('0.0.0.0', 8888), http.server.SimpleHTTPRequestHandler)
#ctx = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
# ctx.load_cert_chain(certfile='./server.pem')
#ctx.load_cert_chain(certfile="/etc/ssl/certs/programmeren9.cmgt.hr.nl.cert", keyfile="/etc/ssl/private/key-programmeren9.cmgt.hr.nl.pem")
#httpd.socket = ctx.wrap_socket(httpd.socket, server_side=True)
#httpd.serve_forever()
