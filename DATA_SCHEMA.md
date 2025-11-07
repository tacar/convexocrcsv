# プロンプトメモ データスキーマ

## 概要
このドキュメントは、プロンプトメモアプリのSwiftDataデータスキーマを定義しています。

## スキーマバージョン
- バージョン: 1.0.0
- フレームワーク: SwiftData

---

## 実際のスキーマ構成

**ファイルパス**: `MyApp.swift:16-24`

```swift
let schema = SwiftData.Schema([
    TodoTask.self,
    Habit.self,
    Meigen.self,
    AppSettings.self,
    GeneratedImage.self,
    PromptTask.self
])
```

---

## モデル一覧

### 1. PromptTask (プロンプトタスク) ⭐️メイン機能
プロンプトの保存と管理を行うメインモデル。このアプリの中心的なデータモデル。

**ファイルパス**: `Features/Todo/Models/PromptTask.swift`

#### プロパティ

| プロパティ名 | 型 | 説明 | デフォルト値 |
|---|---|---|---|
| id | UUID | プロンプトの一意識別子 | UUID() |
| title | String | 説明（プロンプトの説明・メモ、任意） | "" |
| content | String | プロンプト（実際のプロンプト内容） | "" |
| category | String? | カテゴリ名（文字列ベース） | nil |
| createdAt | Date | 作成日時 | Date() |
| updatedAt | Date | 更新日時 | Date() |
| usageCount | Int | 使用回数 | 0 |
| sortOrder | Int | ソート順序 | 0 |

#### メソッド
- `incrementUsage()`: 使用回数を1増やし、更新日時を現在時刻に設定
- `update(title:content:category:tags:)`: プロンプトの内容を更新し、更新日時を設定

#### 表示仕様
**リスト画面（PromptRowView）**:
- `content`: ヘッドラインとして大きく表示（2行まで）
- `title`: サブテキストとして小さく表示（1行、任意）
- カテゴリ、更新日、使用回数も表示

**編集画面（PromptDetailView）**:
- `content`: 「プロンプト」セクション（TextEditor、複数行入力）
- `title`: 「説明」セクション（TextField、1行入力、任意）
- 音声入力、コピー、シェア機能あり

#### 用途
- プロンプトリスト画面での表示
- カテゴリ別のフィルタリング
- 使用頻度の追跡（incrementUsage）
- 画像生成との連携（linkedPromptId）

---

### 2. TodoTask (TODOタスク)
TODOリストの管理モデル。リマインダーや動画選択機能を持つ。

**ファイルパス**: `Features/Models/TodoTask.swift`

#### プロパティ

| プロパティ名 | 型 | 説明 | デフォルト値 |
|---|---|---|---|
| id | UUID | タスクID | UUID() |
| title | String | タスクのタイトル | "" |
| details | String | タスクの詳細 | "" |
| isCompleted | Bool | 完了状態 | false |
| createdAt | Date | 作成日時 | Date() |
| updatedAt | Date | 更新日時 | Date() |
| reminderTime | Date? | リマインダー時刻 | nil |
| isReminderEnabled | Bool | リマインダー有効状態 | true |
| category | String? | カテゴリ名 | nil |
| sortOrder | Int | 並び順 | 0 |
| notificationSound | String | 通知音 | "03_time.caf" |
| selectedVideo | String | 選択された動画 | "none" |

#### プロトコル
- `Comparable`: ソート順、完了状態、作成日でソート可能
- `Identifiable`: IDによる識別

#### 用途
- TODOリスト機能（参考元：./sanko/kaimono）
- リマインダー通知
- 動画連携機能

---

### 3. Habit (習慣管理)
習慣トラッキング用のモデル。

**ファイルパス**: `Features/Models/Habit.swift`

#### プロパティ

| プロパティ名 | 型 | 説明 | デフォルト値 |
|---|---|---|---|
| id | UUID | 習慣ID | UUID() |
| name | String | 習慣名 | "" |
| icon | String | SF Symbolのアイコン名 | "figure.walk" |
| goal | Int | 目標回数/日数 | 7 |
| progress | Int | 現在の進捗回数/日数 | 0 |
| createdAt | Date | 作成日時 | Date() |
| updatedAt | Date | 更新日時 | Date() |
| notes | String | メモ | "" |
| color | String | 習慣の色（ColorTheme） | "blue1" |

#### メソッド
- `progressPercentage`: 進捗率を計算（0.0〜1.0）
- `incrementProgress()`: 進捗を1増やす（最大値は目標値）
- `resetProgress()`: 進捗を0にリセット

#### 用途
- 習慣トラッキング機能
- 進捗の可視化

---

### 4. Meigen (名言管理)
名言・格言の保存モデル。

**ファイルパス**: `Features/Meigen/Model/Meigen.swift`

#### プロパティ

| プロパティ名 | 型 | 説明 | デフォルト値 |
|---|---|---|---|
| id | UUID | 名言ID | UUID() |
| text | String | 名言の本文 | - |
| author | String? | 著者名 | nil |
| createdAt | Date | 作成日時 | Date() |
| order | Int | 表示順序 | 0 |

#### プロトコル
- `Identifiable`: IDによる識別

#### 用途
- 名言表示機能
- モチベーション管理

---

### 5. GeneratedImage (生成画像)
画像生成機能で作成された画像を保存するモデル。

**ファイルパス**: `Features/Imgcreate/GeneratedImage.swift`

#### プロパティ

| プロパティ名 | 型 | 説明 | デフォルト値 |
|---|---|---|---|
| prompt | String | 画像生成に使用したプロンプト | - |
| imageData | Data? | 画像データ（バイナリ） | nil |
| createdAt | Date | 作成日時 | Date() |
| linkedPromptId | String? | 関連するPromptTaskのID | nil |

#### 用途
- 画像生成履歴の保存
- プロンプトとの関連付け
- 履歴画面での表示

---

### 6. AppSettings (アプリ設定)
アプリ全体の設定を保存するモデル。

**ファイルパス**: `Features/Settings/SettingsModel.swift`

#### プロパティ

| プロパティ名 | 型 | 説明 | デフォルト値 |
|---|---|---|---|
| colorTheme | ColorTheme | カラーテーマ | - |
| isJapanese | Bool | 日本語設定 | - |
| speechRate | Double | 音声速度 | 1.0 |

#### 用途
- アプリ全体のテーマ設定
- 言語設定
- 音声読み上げの速度設定

---

## データベース設定

**ファイルパス**: `MyApp.swift:16-38`

```swift
var sharedModelContainer: ModelContainer = {
    let schema = SwiftData.Schema([
        TodoTask.self,
        Habit.self,
        Meigen.self,
        AppSettings.self,
        GeneratedImage.self,
        PromptTask.self
    ])

    let modelConfiguration = ModelConfiguration(
        schema: schema,
        isStoredInMemoryOnly: false,  // 永続化有効
        allowsSave: true               // 保存許可
    )

    do {
        return try ModelContainer(for: schema, configurations: [modelConfiguration])
    } catch {
        fatalError("Could not create ModelContainer: \(error)")
    }
}()
```

---

## 実装上の注意点

### カテゴリの実装
- **PromptTask/TodoTask**: 文字列ベースのカテゴリ（`category: String?`）を使用
- カテゴリは動的に作成・削除可能
- ViewModelでカテゴリリストを管理（`availableCategories`）
- カテゴリ削除時は、そのカテゴリに属するプロンプトは「カテゴリなし」に変更

### 未使用モデル（参考用）
- `Shared/Models/Task.swift`と`Category.swift`は、以前のTODOアプリから引き継がれたファイル
- 現在のスキーマには登録されておらず、使用されていない
- 実際のアプリでは`TodoTask`と`PromptTask`が使用されている

### データの永続化
- すべてのモデルはSwiftDataによってローカルに永続化
- `isStoredInMemoryOnly: false`により、アプリ再起動後もデータが保持される
- iCloudやクラウド同期は実装されていない

---

## データフロー

### プロンプトの作成・編集フロー
```
[PromptListView]
    ↓ (+ボタンタップ)
[PromptDetailView（新規作成）]
    ↓ (content/title入力、category選択、音声入力)
    ↓ (保存ボタン)
[PromptViewModel.createPrompt()]
    ↓
[PromptTask生成 → ModelContext.insert]
    ↓
[SwiftDataコンテナに永続化]
    ↓
[PromptListViewで表示]
```

### 画像生成フロー
```
[PromptDetailView]
    ↓ (画像生成ボタン)
    ↓ (プロンプト保存)
[AdMob広告表示]
    ‖
    ‖ (並行処理)
    ‖
[Gemini API: 日本語→英語翻訳]
    ↓
[Qwen API: 画像生成]
    ↓
[GeneratedImage作成]
    ├→ prompt: 翻訳後のプロンプト
    ├→ imageData: 生成された画像データ
    └→ linkedPromptId: 元のPromptTaskのID
    ↓
[ModelContext.insert → 永続化]
    ↓
[ImageDetailViewで表示]
    ↓
[ImghistoryView（履歴）で一覧表示]
```

### カテゴリ管理フロー
```
[PromptDetailView]
    ↓ (新しいカテゴリ)
[カテゴリ名入力]
    ↓
[PromptViewModel.addCategory()]
    ↓
[availableCategories配列に追加]
    ↓
[PromptListViewのフィルタに表示]

[PromptListView]
    ↓ (カテゴリ長押し)
[削除確認ダイアログ]
    ↓
[該当カテゴリのPromptTaskを検索]
    ↓
[category = nil に更新]
    ↓
[availableCategoriesから削除]
```

### 通知フロー（TODOタスク用）
```
[TODOタスク作成]
    ↓ (reminderTime設定)
[TodoTask保存]
    ↓
[通知スケジュール登録]
    ↓ (設定時刻)
[ローカル通知発火]
    ↓ (notificationSound再生)
[ユーザーに通知]
```

---

## 関連ファイル一覧

### モデルファイル
| モデル | ファイルパス |
|---|---|
| PromptTask | `Features/Todo/Models/PromptTask.swift` |
| TodoTask | `Features/Models/TodoTask.swift` |
| Habit | `Features/Models/Habit.swift` |
| Meigen | `Features/Meigen/Model/Meigen.swift` |
| GeneratedImage | `Features/Imgcreate/GeneratedImage.swift` |
| AppSettings | `Features/Settings/SettingsModel.swift` |

### ビューファイル（プロンプト機能）
| ビュー | ファイルパス | 説明 |
|---|---|---|
| PromptListView | `Features/Todo/Views/PromptListView.swift` | プロンプト一覧画面 |
| PromptDetailView | `Features/Todo/Views/PromptDetailView.swift` | プロンプト編集画面 |
| PromptRowView | `Features/Todo/Views/PromptRowView.swift` | プロンプト行表示 |
| PromptCategoryListView | `Features/Todo/Views/PromptCategoryListView.swift` | カテゴリ一覧 |
| PromptCategoryFormView | `Features/Todo/Views/PromptCategoryFormView.swift` | カテゴリ編集 |

### ViewModelファイル
| ViewModel | ファイルパス | 説明 |
|---|---|---|
| PromptViewModel | `Features/Todo/ViewModels/PromptViewModel.swift` | プロンプト管理ロジック |
| AppSettingsManager | - | アプリ設定管理（@StateObject） |

### サービスファイル
| サービス | ファイルパス | 説明 |
|---|---|---|
| QwenAPIService | `Features/Imgcreate/QwenAPIService.swift` | 画像生成API |
| GeminiAPIService | - | 翻訳API |
| SpeechRecognitionService | `Features/Todo/Views/SpeechRecognitionService.swift` | 音声入力 |
| AdMobService | - | 広告表示 |

### 画像生成関連
| ファイル | ファイルパス | 説明 |
|---|---|---|
| ImgcreateView | `Features/Imgcreate/ImgcreateView.swift` | 画像生成画面 |
| ImghistoryView | `Features/Imgcreate/ImghistoryView.swift` | 画像履歴画面 |
| ImageDetailView | - | 画像詳細表示 |

### エントリーポイント
| ファイル | ファイルパス | 説明 |
|---|---|---|
| MyApp | `MyApp.swift` | アプリエントリーポイント、ModelContainer定義 |
| AppTabView | `Features/Navigation/AppTabView.swift` | タブナビゲーション |

---

## バージョン履歴

- **2025-11-04**: 初版作成
  - 実際のアプリコードと照合して作成
  - 6つのSwiftDataモデルを文書化
  - データフローと関連ファイルを追加
