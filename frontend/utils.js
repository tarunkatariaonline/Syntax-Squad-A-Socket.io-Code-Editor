const BASE_URL_S_IO_LIVE="https://syntaxsquad-py2d.onrender.com"
const BASE_URL_S_IO_LOCAL="http://localhost:3000/"
const BASE_URL=BASE_URL_S_IO_LOCAL
const languages = [
  {
    "id": 50,
    "name": "C (GCC 9.2.0)",
    "code": "#include <stdio.h>\n\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}"
  },
  {
    "id": 54,
    "name": "C++ (GCC 9.2.0)",
    "code": "#include <iostream>\n\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}"
  },
  {
    "id": 62,
    "name": "Java (OpenJDK 13.0.1)",
    "code": "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}"
  },
  {
    "id": 63,
    "name": "JavaScript (Node.js 12.14.0)",
    "code": "console.log(\"Hello, World!\");"
  }
]

export {BASE_URL,languages}