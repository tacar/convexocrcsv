// HTTP Actions を無効化するため、このファイルは http.ts からリネームされました
// Convex標準のFunctions API (/api/query, /api/mutation) を使用
import { httpRouter } from "convex/server";

const http = httpRouter();

export default http;
