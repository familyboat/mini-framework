# Mini Framework Lib

`lib` 提供四组基础能力：路由、Modal、动画和交互控制。推荐从统一入口导入：

```ts
import {
  Modal,
  Router,
  fadeIn,
  enterElement,
  disableInteraction,
} from "lib";
```

## 模块职责

- `router`：创建和切换页面路由。
- `modal`：创建、显示、隐藏和销毁 Modal。
- `animate`：播放 CSS Animation，并处理完成、取消和同元素动画竞争。
- `interaction`：控制元素是否接受用户交互。
- `toast`：轻量级通知组件，用于展示短时提示消息。

动画和交互是两个独立概念：动画模块不会移除用户事件监听器；交互模块只负责交互状态。

## CSS 类名命名规则

整个项目要保持一致的前提是：不同层次的类名分别遵守不同的命名约定，而不是混用。

### 1) 组件根类

组件根类使用单独的基础名，并保留实例级别的命名：

- `page`：页面容器根类
- `page-${name}`：具体页面的实例根类
- `modal`：弹层容器根类
- `modal-${name}`：具体 Modal 的实例根类
- `toast-container`：Toast 容器根类
- `toast`：单个 Toast 根类

这样可以一眼看出：

- `page` / `modal` / `toast` 是公共基础结构
- `page-${name}` / `modal-${name}` 是实例特有的标识

### 2) 组件内部元素使用 BEM

组件内部的元素统一使用 BEM 风格：

- `__` 表示元素，例如 `toast__message`、`toast__close`
- `--` 表示修饰状态，例如 `toast--success`、`toast--error`
- `toast-container--top` / `toast-container--bottom` 表示容器位置修饰

因此，整个项目中，组件内部的“结构类名”应统一使用：

- `block__element`
- `block--modifier`

例如：

```css
.modal__dialog {}
.modal__mask {}
.modal__content {}
.toast__message {}
.toast__close {}
.toast--success {}
```

### 3) CSS 变量统一使用 `--z-index-*` 命名

全局层级变量统一使用 `--z-index-*` 的命名形式，当前项目中的变量如下：

```css
:root {
  --z-index-page: 1;
  --z-index-modal: 10;
  --z-index-toast: 100;
}
```

这里的命名规则是：

- `--z-index-page`：页面层级
- `--z-index-modal`：弹层层级
- `--z-index-toast`：Toast 层级

后续新增的层级变量也应遵循同一规则：`--z-index-<component-name>`。

这类变量的作用是统一声明层级顺序，避免各处散落的 magic number。

### 4) 动画类名单独使用 kebab-case

动画类是 CSS Animation 的入口，不属于组件 BEM 结构，因此统一使用简单的 kebab-case：

- `fade-in`
- `fade-out`
- `left-slide-in`
- `right-slide-in`
- `left-slide-out`
- `right-slide-out`

这类类名的职责是“告诉动画模块应该播放哪一种动画”，因此它们不应再混用 BEM 的 `__` / `--` 语法。

### 5) 代码中的私有字段

TypeScript / JavaScript 中的私有字段使用 `_` 前缀：

- `_root`
- `_container`
- `_timer`
- `_operationId`

这部分是内部状态，不属于 CSS 类名，不参与 DOM 结构命名。

### 6) 项目里当前的统一规则

项目里推荐的统一规则总结如下：

```text
根类：page / modal / toast / toast-container
实例类：page-${name} / modal-${name}
元素：block__element
修饰：block--modifier
动画：fade-in / left-slide-in / ...
私有字段：_fieldName
```

在实际开发中，新的 CSS 类名应优先遵循这个规则；如果发现旧类名存在混用，则应尽快改为统一的命名形式。

## 组件目录结构约定

为了让项目结构更稳定、可扩展，也更接近 Angular 的组件组织方式，后续新增的页面和弹窗建议统一采用“目录即组件”的组织形式。

推荐结构：

```text
src/
  pages/
    landing/
      index.ts
      index.html
      index.css
    loading/
      index.ts
      index.html
      index.css
  modal/
    leaderboard/
      index.ts
      index.css
      index.html
```

### 规则

- 目录名就是组件名，例如 `landing`、`loading`、`leaderboard`
- 组件目录内统一使用以下三类文件：
  - `index.ts`：组件逻辑
  - `index.html`：组件模板
  - `index.css`：组件样式
- `index.ts` 应优先使用本地模板和样式：

```ts
import landingTemplate from "./index.html?raw";
import "./index.css";
```

- 对外引用时，优先通过目录入口引用，而不是直接指向具体文件名，例如：

```ts
import { Landing } from "./pages/landing";
import { Leaderboard } from "./modal/leaderboard";
```

这样可以保证组件目录具有明确边界，也方便后续扩展更多文件，例如 `index.spec.ts`、`types.ts`、`assets/` 等。

## 模板渲染约定

如果你希望模板内容像 HTML 文件一样有更好的编辑器支持、标签补全和格式化体验，建议使用真实的 HTML 模板文件来编写结构，再在 TS 中通过 `renderTemplate()` 注入变量。

### 推荐写法

```ts
import { renderTemplate, Route } from "lib";
import settingsTemplate from "./index.html?raw";

export class Settings extends Route {
  protected render(): void {
    this.root.innerHTML = renderTemplate(settingsTemplate, {
      title: "Settings",
    });
  }
}
```

对应的模板文件：

```html
<!-- src/pages/settings/index.html -->
<div class="page">
  <h1>{{title}}</h1>
</div>
```

### 变量插入规则

`renderTemplate()` 会把模板中的 `{{name}}` 替换成传入对象里的值：

```ts
renderTemplate(template, {
  title: "Landing",
  count: 3,
  enabled: true,
});
```

当前实现中会把 `null` / `undefined` 视为空字符串，其他值会转换成字符串。

### 什么时候使用哪种方式

- 复杂结构、需要编辑器 HTML 提示、需要更好的格式化体验：优先使用 `.html` 模板文件
- 纯粹的简单字符串模板、临时内容：也可以继续用 `html\`...\``

`html\`...\``` 仍然保留作为运行时的通用模板能力，但从工程约定上看，结构较复杂的页面更推荐使用 `.html` 模板文件。

## Toast

Toast 是一个独立的轻量通知组件，不继承 `Route` 或 `Modal`，适合用于显示短时提示。

### 公开 API

```ts
import { Toast } from "lib";

Toast.show({
  message: "保存成功",
  kind: "success",
  duration: 3000,
  position: "top",
});
```

### 可用参数

```ts
export type ToastProps = {
  message: string;
  duration?: number;
  position?: "top" | "bottom";
  kind?: "info" | "success" | "error";
};
```

### 常用用法

```ts
Toast.show({ message: "Hello" });
Toast.show({ message: "上传失败", kind: "error" });
Toast.show({ message: "已保存", kind: "success", position: "bottom" });
```

### 行为约定

- 默认 `duration` 为 `3000ms`
- 默认 `position` 为 `top`
- 默认 `kind` 为 `info`
- `Toast.clear()` 可清空当前所有可见 Toast
- `Toast` 会自动管理容器，避免多次重复创建同位置节点

### 组件目录结构

Toast 也遵循同样的目录组织方式：

```text
lib/
  toast/
    index.ts
    index.css
```

## Router

### 创建 Route

Route 不能直接通过 `new` 创建。具体页面应使用继承自基类的 `static create()` 工厂：

```ts
import { Route } from "lib";
import type { RouteProps } from "lib";

export class Settings extends Route {
  protected render(): void {
    this.root.innerHTML = renderTemplate(settingsTemplate, {
      title: "Settings",
    });
  }

  protected onEnter(operationId: number): void {
    // 当该路由变为当前路由时触发
    // operationId 可以用来判定异步任务是否已失效
  }

  protected onLeave(operationId: number): void {
    // 当该路由被切走时触发
    // 可在这里停止定时器、清理状态和播放离场动画
  }
}
```

`create()` 会在基类中完成 `new`、`initialize()` 和缓存注册。这样可以保证实例在进入业务代码前已经渲染并注册完成。

### 注册和导航

```ts
Settings.create({ name: "settings" });
Router.navigate("settings");
```

`Router.navigate(name)` 的行为：

- 未注册的名称会抛出错误。
- 导航到当前路由会被忽略。
- 切换路由时会先调用旧路由的 `hide()`，再调用新路由的 `show()`。
- 每次有效导航都会产生新的操作编号。

Route 和 Modal 都支持 `stale-operation` 保护：每次 `show()` / `hide()` 都会递增一个操作编号，后续异步回调在执行前会校验编号是否仍然是当前最新值。

页面中的延迟任务可以保存当前 `operationId`，并在任务执行时校验：

```ts
const operationId = this.beginOperation();

setTimeout(() => {
  if (!this.isCurrentOperation(operationId)) {
    return; // 当前任务已经过期
  }

  Router.navigate("settings");
}, 1000);
```

在 Route 中，`show()` / `hide()` 会自动触发 `onEnter(operationId)` / `onLeave(operationId)`，因此子类可以直接接收并校验当前有效性；在 Modal 中，`show()` / `hide()` 也会自动触发 `onShow(operationId)` / `onHide(operationId)`，并在需要时通过 `isCurrentOperation(operationId)` 判断异步回调是否仍然有效。

### 公开生命周期约定

无论是 Route 还是 Modal，公开 API 都遵循同一套约定：

- 具体类型不应直接暴露 `new` 构造入口，统一依赖基类的 `create()` 工厂。
- `create()` 会做两件事：先完成 `new`，再立即调用受保护的 `initialize()`。
- `initialize()` 负责一次性渲染与缓存注册；失败时会回滚实例与 DOM。
- `show()` / `hide()` 会先调用 `beginOperation()`，生成新的 `operationId`，然后再进入对应的生命周期钩子。
- 子类在 `onEnter()` / `onLeave()` / `onShow()` / `onHide()` 中实现业务行为时，应在异步回调里校验 `operationId` 是否仍然有效。
- `dispose()` 只负责清理子类自身创建的资源，不能替代 `render()` 与 `initialize()` 的初始化职责。

这样可以保证：调用方拿到的是已经初始化好的实例，而不是半成品；同时，也可以避免旧异步动作覆盖最新状态。

## Modal

### 创建 Modal

Modal 也必须通过继承自基类的 `static create()` 工厂创建：

```ts
import { Modal } from "lib";
import type { ModalProps } from "lib";

class HelpModal extends Modal {
  protected render(): void {
    this.root.innerHTML = renderTemplate(helpModalTemplate, {
      title: "Help",
    });
  }

  protected onShow(operationId: number): void {
    // 播放进入动画
    // operationId 可以在需要时用于异步任务有效性判断
  }

  protected onHide(operationId: number): void {
    // 异步隐藏完成后检查操作是否仍然有效
    if (this.isCurrentOperation(operationId)) {
      // 隐藏 root
    }
  }

  protected dispose(): void {
    // 移除子类自己注册的事件、定时器和订阅
  }
}

HelpModal.create({ name: "help" });
```

Modal 的生命周期：

```text
具体工厂
  -> private constructor
  -> super
  -> initialize
    -> render
    -> 注册到 Modal 缓存
  -> 返回已初始化实例
```

不要直接调用 `render()`，也不要直接 `new` 具体 Modal。`render()` 是受保护的，并且每个实例只能通过 `initialize()` 成功执行一次。

### 显示、隐藏和销毁

```ts
Modal.show("help");
Modal.hide("help");
Modal.destroy("help");
```

也可以保存工厂返回的实例：

```ts
const help = HelpModal.create({ name: "help" });
help.destroy();
```

`destroy()` 会：

- 使未完成的 Modal 操作失效。
- 调用子类的 `dispose()`。
- 从 Modal 注册表中移除实例。
- 从文档中移除 Modal 根节点。

子类应该在 `dispose()` 中清理自己创建的资源，例如绑定在 `window`、`document` 或其他外部对象上的监听器，以及定时器和订阅。

基类公开的 `show()` 和 `hide()` 会自动检查销毁状态并生成操作编号。子类只需要实现受保护的 `onShow(operationId)` 和 `onHide(operationId)`，不需要手动调用 `assertUsable()` 或 `beginOperation()`。

> 统一设计说明：Route 和 Modal 都采用同一套 `stale-operation` 保护模型。不同之处在于 Route 的异步入参通常在 `onEnter/onLeave` 中接收，而 Modal 的异步入参通常在 `onHide` 中接收；但两者的核心思想都是相同的：让旧回调在新的操作发生后自动失效，防止过期状态覆盖当前状态。

## Animate

### 内置动画

```ts
fadeIn(element);
fadeOut(element);
leftSlideIn(element);
rightSlideIn(element);
leftSlideOut(element);
rightSlideOut(element);
```

这些函数返回 `Promise<boolean>`：

- `true`：动画正常结束。
- `false`：动画被取消。

可以传入 CSS 时间配置：

```ts
fadeIn(element, {
  duration: "300ms",
  delay: "100ms",
});
```

配置通过 `--duration` 和 `--delay` 传递给 CSS Animation，动画结束后会恢复调用前的值。

### 自定义动画

自定义动画有两部分组成：

1. 通过声明合并扩展 `EnterAnimationNameMap` / `LeaveAnimationNameMap`，让 TypeScript 能识别新的动画名；
2. 在你的 CSS 中定义对应的 class 名和 `@keyframes`，并按 `enterElement()` / `leaveElement()` 的方式调用。

例如，扩展 enter / leave 的动画名称时，名称本身就应和 CSS 中的类名保持一致：

```ts
declare module "@familyboat/mini-framework" {
  interface EnterAnimationNameMap {
    "bounce-in": never;
  }

  interface LeaveAnimationNameMap {
    "bounce-out": never;
  }
}
```

之后就可以直接这样使用：

```ts
enterElement(root, "bounce-in");
leaveElement(root, "bounce-out");
```

如果要调整动画时长或延迟，请通过 `AnimationOptions`：

```ts
enterElement(root, "bounce-in", {
  duration: "400ms",
  delay: "100ms",
});
```

在 CSS 中，类名要和 `@keyframes` 名保持一致，并且也要和扩展到的动画名称完全一致：

```css
.bounce-in {
  --duration: 500ms;
  --delay: 0s;
  animation: bounce-in var(--duration) ease var(--delay);
}

@keyframes bounce-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.bounce-out {
  --duration: 500ms;
  --delay: 0s;
  animation: bounce-out var(--duration) ease var(--delay);
}

@keyframes bounce-out {
  from {
    opacity: 1;
    transform: scale(1);
  }

  to {
    opacity: 0;
    transform: scale(0.8);
  }
}
```

然后调用：

```ts
enterElement(element, "bounce-in");
leaveElement(element, "bounce-out");
```

其中，`leaveElement()` 在动画正常结束后会隐藏元素；如果动画被取消，则不会执行隐藏回调。

### 动画并发规则

同一个元素同时只能保留一个活动动画：

```ts
const first = fadeIn(element);
const second = fadeOut(element);
```

后启动的动画会取消前一个动画。前一个 Promise 会解析为 `false`，新动画继续执行。

同名动画不会被自动去重；JavaScript 重复调用仍会启动新的动画。动画模块处理的是动画竞争，不是命令式调用去重。

## Interaction

### 独立控制交互

```ts
import { disableInteraction } from "lib";

const restore = disableInteraction(element);

// 此时 element 及其后代不会接受用户交互
restore();
```

`disableInteraction()` 使用元素的 `inert` 状态，并返回恢复函数。调用时会保存原有状态，因此恢复时不会强行覆盖调用前的设置。

动画模块会在动画开始时自动禁用动画根元素的交互，并在动画正常结束或取消时恢复。这个行为只改变用户交互状态，不会移除事件监听器，也不会阻止 JavaScript 直接调用动画函数。

## 推荐约定

```text
Route / Modal：负责生命周期和业务状态
Animate：负责 CSS Animation 的播放、取消和完成结果
Interaction：负责 inert、焦点和用户交互状态
用户代码：负责事件、定时器、请求和订阅的业务清理
```

创建 Route 或 Modal 时始终使用具体类的 `create()` 工厂；实现异步 `show()` 或 `hide()` 时使用操作编号，避免过期回调覆盖更新后的状态。
