import os

BASE_DIR = ""

STRUCTURE = {
    "package.json": "",
    "vite.config.js": "",
    "index.html": "",
    ".env": "",
    "public": {
        "favicon.ico": ""
    },
    "src": {
        "main.jsx": "",
        "App.jsx": "",
        "index.css": "",
        "api": {
            "http.js": "",
            "auth.js": "",
            "users.js": "",
            "products.js": "",
            "pickRequests.js": "",
            "health.js": ""
        },
        "context": {
            "AuthContext.jsx": ""
        },
        "components": {
            "Layout": {
                "DashboardLayout.jsx": "",
                "Sidebar.jsx": "",
                "Topbar.jsx": ""
            },
            "ProtectedRoute.jsx": "",
            "BarcodeScanner.jsx": "",
            "RequesterScanner.jsx": "",
            "PickerScanner.jsx": ""
        },
        "pages": {
            "LoginPage.jsx": "",
            "DashboardPage.jsx": "",
            "UsersPage.jsx": "",
            "ProductsPage.jsx": "",
            "PickRequestsPage.jsx": "",
            "CreateRequestPage.jsx": "",
            "PickRequestDetailPage.jsx": "",
            "ScannerPage.jsx": "",
            "HealthPage.jsx": ""
        },
        "utils": {
            "websocket.js": ""
        }
    }
}


def create_structure(base_path, structure):
    for name, content in structure.items():
        path = os.path.join(base_path, name)

        if isinstance(content, dict):
            os.makedirs(path, exist_ok=True)
            create_structure(path, content)
        else:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)


if __name__ == "__main__":
    create_structure(".", {BASE_DIR: STRUCTURE})
    print("✔ warehouse-frontend structure created")
