from flask import Flask, request, jsonify
from waitress import serve
from google.cloud import storage
import os

app = Flask(__name__, static_folder='./build', static_url_path='/')

@app.route('/')
def index():
    return app.send_static_file('index.html')


# # this is for deployment
# if __name__ == "__main__":
#     app.debug = False
#     PORT = os.environ.get('PORT', '5000')
#     serve(app, host='0.0.0.0', port=PORT)

# this is for your local environment
if __name__ == "__main__":
    app.debug = True
    PORT = os.environ.get('PORT', '5000')
    app.run()
