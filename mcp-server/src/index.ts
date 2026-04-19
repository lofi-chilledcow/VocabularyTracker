import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios, { AxiosError } from "axios";
import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ quiet: true });

const API_URL = process.env.API_URL || "http://192.168.1.224:5000";
const api = axios.create({ baseURL: API_URL });

const server = new McpServer({
  name: "vocabulary-tracker",
  version: "1.0.0",
});

function errorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data;
    const detail =
      typeof data === "object" ? JSON.stringify(data) : String(data ?? "");
    return `API error ${err.response?.status ?? "unknown"}: ${detail || err.message}`;
  }
  return String(err);
}

// 1. add_word
server.tool(
  "add_word",
  "Add a new word to VocabularyTracker",
  {
    word: z.string().describe("The word to add"),
    meaning: z.string().describe("The meaning of the word"),
    sentence: z.string().optional().describe("An example sentence"),
    category: z.string().optional().describe("Word category"),
    antonym: z.string().optional().describe("Antonym of the word"),
    synonyms: z.array(z.string()).optional().describe("List of synonyms"),
  },
  async (params) => {
    try {
      const res = await api.post("/api/words", params);
      return {
        content: [
          {
            type: "text",
            text: `Word added successfully:\n${JSON.stringify(res.data, null, 2)}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Failed to add word: ${errorMessage(err)}` }],
        isError: true,
      };
    }
  }
);

// 2. search_words
server.tool(
  "search_words",
  "Search words by keyword",
  {
    q: z.string().describe("Search keyword"),
  },
  async ({ q }) => {
    try {
      const res = await api.get("/api/words", { params: { q } });
      return {
        content: [
          {
            type: "text",
            text: `Search results for "${q}":\n${JSON.stringify(res.data, null, 2)}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Search failed: ${errorMessage(err)}` }],
        isError: true,
      };
    }
  }
);

// 3. list_words
server.tool(
  "list_words",
  "List all words with optional sort and category filter",
  {
    sort: z
      .enum(["date", "alpha", "category"])
      .optional()
      .describe("Sort order: date, alpha, or category"),
    category: z.string().optional().describe("Filter by category"),
  },
  async (params) => {
    try {
      const res = await api.get("/api/words", { params });
      return {
        content: [
          {
            type: "text",
            text: `Words:\n${JSON.stringify(res.data, null, 2)}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Failed to list words: ${errorMessage(err)}` }],
        isError: true,
      };
    }
  }
);

// 4. get_word
server.tool(
  "get_word",
  "Get a single word by id",
  {
    id: z.string().describe("Word ID"),
  },
  async ({ id }) => {
    try {
      const res = await api.get(`/api/words/${id}`);
      return {
        content: [
          {
            type: "text",
            text: `Word details:\n${JSON.stringify(res.data, null, 2)}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Failed to get word: ${errorMessage(err)}` }],
        isError: true,
      };
    }
  }
);

// 5. delete_word
server.tool(
  "delete_word",
  "Delete a word by id",
  {
    id: z.string().describe("Word ID"),
  },
  async ({ id }) => {
    try {
      const res = await api.delete(`/api/words/${id}`);
      return {
        content: [
          {
            type: "text",
            text: `Word deleted successfully:\n${JSON.stringify(res.data, null, 2)}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Failed to delete word: ${errorMessage(err)}` }],
        isError: true,
      };
    }
  }
);

// 6. get_stats
server.tool(
  "get_stats",
  "Get vocabulary statistics",
  {},
  async () => {
    try {
      const res = await api.get("/api/stats");
      return {
        content: [
          {
            type: "text",
            text: `Vocabulary statistics:\n${JSON.stringify(res.data, null, 2)}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Failed to get stats: ${errorMessage(err)}` }],
        isError: true,
      };
    }
  }
);

// 7. get_daily
server.tool(
  "get_daily",
  "Get words added on a specific date",
  {
    date: z
      .string()
      .optional()
      .describe("Date in YYYY-MM-DD format (defaults to today)"),
  },
  async ({ date }) => {
    try {
      const params = date ? { date } : {};
      const res = await api.get("/api/daily", { params });
      const label = date ?? new Date().toISOString().slice(0, 10);
      return {
        content: [
          {
            type: "text",
            text: `Words for ${label}:\n${JSON.stringify(res.data, null, 2)}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Failed to get daily words: ${errorMessage(err)}` }],
        isError: true,
      };
    }
  }
);

// 8. list_categories
server.tool(
  "list_categories",
  "List all word categories with counts",
  {},
  async () => {
    try {
      const res = await api.get("/api/categories");
      return {
        content: [
          {
            type: "text",
            text: `Categories:\n${JSON.stringify(res.data, null, 2)}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Failed to list categories: ${errorMessage(err)}` }],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("VocabularyTracker MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
