from http.server import HTTPServer, SimpleHTTPRequestHandler
from ssl import PROTOCOL_TLS_SERVER, SSLContext

ssl_context = SSLContext(PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain("/etc/ssl/certs/programmeren9.cmgt.hr.nl.cert", "/etc/ssl/private/key-programmeren9.cmgt.hr.nl.pem")
server = HTTPServer(("0.0.0.0", 8888), SimpleHTTPRequestHandler)
server.socket = ssl_context.wrap_socket(server.socket, server_side=True)
server.serve_forever()
