# Getting Started

1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Create a virtual environment:
    ```bash
    python3 -m venv venv
    ```
3. Activate the virtual environment:
    - On Windows:
        ```bash
        venv\Scripts\activate
        ```
    - On macOS/Linux:
        ```bash
        source venv/bin/activate
        ```
4. Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5. Set the `FLASK_APP` environment variable:
    - On Windows:
        ```bash
        set FLASK_APP=app
        ```
    - On macOS/Linux:
        ```bash
        export FLASK_APP=app
        ```
6. Start the backend server:
    ```bash
    flask run
    ```