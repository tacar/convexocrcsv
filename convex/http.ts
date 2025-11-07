import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

// ユーザー登録/取得エンドポイント
http.route({
  path: "/promptUsers/getOrCreateUser",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { externalId, email, displayName } = body as {
      externalId: string;
      email: string;
      displayName: string;
    };

    console.log("[HTTP] getOrCreateUser", { externalId, email, displayName });

    const userId = await ctx.runMutation(api.promptUsers.getOrCreateUser, {
      externalId,
      email,
      displayName,
    });

    return new Response(JSON.stringify(userId), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

/**
 * ユーザーのdisplayName更新エンドポイント
 *
 * Firebase Authenticationに紐づくユーザーのdisplayNameを更新します。
 *
 * @endpoint POST /promptUsers/updateDisplayName
 * @param {string} externalId - Firebase AuthenticationのUID (prompt_users.externalId)
 * @param {string} displayName - 新しい表示名
 * @returns {object} { success: true, displayName: string }
 * @throws {400} displayNameが空の場合
 * @throws {404} 指定されたexternalIdのユーザーが見つからない場合
 * @throws {500} サーバー内部エラー
 *
 * @example
 * // Request
 * POST /promptUsers/updateDisplayName
 * {
 *   "externalId": "ML3Fwg21TnU6BpzYixmlLI1qz022",
 *   "displayName": "山田太郎"
 * }
 *
 * // Response (200 OK)
 * {
 *   "success": true,
 *   "displayName": "山田太郎"
 * }
 */
http.route({
  path: "/promptUsers/updateDisplayName",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { externalId, displayName } = body as {
        externalId: string;
        displayName: string;
      };

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("[HTTP] updateDisplayName - 開始");
      console.log("  ┣━ externalId:", externalId);
      console.log("  ┗━ displayName:", displayName);

      // バリデーション
      if (!externalId || externalId.trim() === "") {
        console.error("[HTTP] updateDisplayName - エラー: externalIdが空です");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        return new Response(JSON.stringify({
          error: "externalIdは必須です",
          success: false
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      if (!displayName || displayName.trim() === "") {
        console.error("[HTTP] updateDisplayName - エラー: displayNameが空です");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        return new Response(JSON.stringify({
          error: "displayNameは必須です",
          success: false
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      // Mutation実行
      const result = await ctx.runMutation(api.promptUsers.updateDisplayName, {
        externalId: externalId.trim(),
        displayName: displayName.trim(),
      });

      console.log("✅ [HTTP] updateDisplayName - 成功");
      console.log("  ┗━ Result:", result);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      console.error("❌ [HTTP] updateDisplayName - エラー発生");
      console.error("  ┗━ Error:", error);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      return new Response(JSON.stringify({
        error: error.message || "Internal server error",
        success: false
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }),
});

// 共有プロンプト一覧取得エンドポイント
http.route({
  path: "/promptItems/getSharedItems",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { userId } = body as { userId: string };

    console.log("[HTTP] getSharedItems", { userId });

    // userIdをId型に変換（必要な場合）
    let userIdParam: Id<"prompt_users"> | undefined;

    // ゲストまたは無効なuserIdの場合はダミーを使う
    if (userId && userId !== "guest") {
      try {
        userIdParam = userId as Id<"prompt_users">;
      } catch {
        // 変換失敗時は既存のユーザーを検索するか、ダミーを使う
        console.log("[HTTP] Invalid userId, using first user");
      }
    }

    // もしuserIdが不正な場合は、とりあえず最初のユーザーを取得
    if (!userIdParam) {
      const users = await ctx.runQuery(api.promptUsers.getUserByExternalId, {
        externalId: "dummy",
      });

      // ダミーユーザーが存在しない場合は新規作成
      if (!users) {
        const result = await ctx.runMutation(api.promptUsers.getOrCreateUser, {
          externalId: "guest",
          email: "guest@example.com",
          displayName: "ゲスト",
        });
        userIdParam = result.userId;
      }
    }

    // 最終的にuserIdがない場合でも、適当なIDを渡す（getSharedItemsはuserIdを必須としているため）
    // 実際には共有アイテムの取得にuserIdは不要なので、ダミーで良い
    if (!userIdParam) {
      // 最初のユーザーを取得してそのIDを使う、または固定のダミーIDを使う
      userIdParam = "jd74h1x51y4h1x51y4h1x51y4h1x51y" as Id<"prompt_users">;
    }

    const items = await ctx.runQuery(api.promptItems.getSharedItems, {
      userId: userIdParam,
    });

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// プロンプトアップロードエンドポイント（共有TODO作成）
http.route({
  path: "/promptItems/uploadShared",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { title, content, category, userId, userName } = body as {
      title?: string;      // 説明（オプション）
      content: string;     // プロンプト（必須）
      category?: string;
      userId: string;
      userName: string;
    };

    console.log("[HTTP] uploadShared", { title, content, category, userId, userName });

    // プロンプト（content）の必須チェック
    if (!content || content.trim() === "") {
      console.error("[HTTP] uploadShared error: content is required");
      return new Response(JSON.stringify({
        error: "プロンプトは必須です",
        message: "プロンプト（content）を入力してください",
        success: false
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    try {
      // Firebase UID (externalId) からConvex userIdを取得
      const user = await ctx.runQuery(api.promptUsers.getUserByExternalId, {
        externalId: userId,
      });

      if (!user) {
        console.error("[HTTP] uploadShared error: user not found", { userId });
        return new Response(JSON.stringify({
          error: "ユーザーが見つかりません",
          message: "先にログインしてください",
          success: false
        }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      const userIdTyped = user._id;

      // カテゴリを取得または作成
      let categoryId: Id<"prompt_categories">;

      if (category) {
        // 既存のカテゴリを検索
        const categories = await ctx.runQuery(api.promptCategories.getByUser, {
          userId: userIdTyped,
        });

        const existingCategory = categories.find((cat) => cat.name === category);

        if (existingCategory) {
          categoryId = existingCategory._id;
        } else {
          // カテゴリを新規作成
          categoryId = await ctx.runMutation(api.promptCategories.create, {
            name: category,
            userId: userIdTyped,
          });
        }
      } else {
        // デフォルトカテゴリ「共有TODO」を使用
        const categories = await ctx.runQuery(api.promptCategories.getByUser, {
          userId: userIdTyped,
        });

        const sharedCategory = categories.find((cat) => cat.name === "共有TODO");

        if (sharedCategory) {
          categoryId = sharedCategory._id;
        } else {
          // 「共有TODO」カテゴリを作成
          categoryId = await ctx.runMutation(api.promptCategories.create, {
            name: "共有TODO",
            userId: userIdTyped,
          });
        }
      }

      // TODOアイテムを作成（共有状態で）
      // title（説明）があればそれを使用、なければcontent（プロンプト）の最初の50文字
      const itemTitle = title && title.trim() !== ""
        ? title
        : content.substring(0, 50) + (content.length > 50 ? "..." : "");

      const itemId = await ctx.runMutation(api.promptItems.create, {
        categoryId,
        title: itemTitle,      // タイトル（説明 or プロンプトの一部）
        content: content,       // プロンプト本文
        isShared: true,         // 常に共有状態で作成
        userId: userIdTyped,
      });

      console.log("[HTTP] uploadShared success", { itemId, title: itemTitle });

      return new Response(JSON.stringify({
        convexId: itemId,
        categoryId,
        title: itemTitle,
        success: true
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      console.error("[HTTP] uploadShared error", error);
      return new Response(JSON.stringify({
        error: error.message || "Upload failed",
        success: false
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }),
});

// プロンプト削除エンドポイント
http.route({
  path: "/promptItems/deleteShared",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { convexId, userId } = body as {
      convexId: string;
      userId: string;
    };

    console.log("[HTTP] deleteShared", { convexId, userId });

    try {
      // Firebase UID (externalId) からConvex userIdを取得
      const user = await ctx.runQuery(api.promptUsers.getUserByExternalId, {
        externalId: userId,
      });

      if (!user) {
        console.error("[HTTP] deleteShared error: user not found", { userId });
        return new Response(JSON.stringify({
          error: "ユーザーが見つかりません",
          success: false
        }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      await ctx.runMutation(api.promptItems.remove, {
        id: convexId as Id<"prompt_items">,
        userId: user._id,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      console.error("[HTTP] deleteShared error", error);
      return new Response(JSON.stringify({
        error: error.message || "Delete failed",
        success: false
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }),
});

// プロンプト通報エンドポイント
http.route({
  path: "/promptItems/reportPrompt",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { promptItemId, userId, reason, details } = body as {
      promptItemId: string;
      userId: string;
      reason: string;
      details?: string;
    };

    console.log("[HTTP] reportPrompt", { promptItemId, userId, reason });

    try {
      // 通報データを保存
      await ctx.runMutation(api.promptReports.create, {
        promptItemId,
        reportedByUserId: userId,
        reason,
        details,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      console.error("[HTTP] reportPrompt error", error);
      return new Response(JSON.stringify({
        error: error.message || "Report failed",
        success: false
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }),
});

// 管理者用: 共有解除エンドポイント
http.route({
  path: "/promptItems/admin/updateSharedStatus",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { promptItemId, isShared, adminUserId } = body as {
      promptItemId: string;
      isShared: boolean;
      adminUserId: string;
    };

    console.log("[HTTP] updateSharedStatus", { promptItemId, isShared, adminUserId });

    try {
      await ctx.runMutation(api.promptItems_admin.updateSharedStatus, {
        promptItemId: promptItemId as any,
        isShared,
        adminUserId,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      console.error("[HTTP] updateSharedStatus error", error);
      return new Response(JSON.stringify({
        error: error.message || "Update failed",
        success: false
      }), {
        status: error.message?.includes("管理者権限") ? 403 : 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }),
});

// CORS対応
http.route({
  path: "/promptUsers/getOrCreateUser",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

http.route({
  path: "/promptUsers/updateDisplayName",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

http.route({
  path: "/promptItems/getSharedItems",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

http.route({
  path: "/promptItems/uploadShared",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

http.route({
  path: "/promptItems/deleteShared",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

http.route({
  path: "/promptItems/reportPrompt",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

http.route({
  path: "/promptItems/admin/updateSharedStatus",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

export default http;
