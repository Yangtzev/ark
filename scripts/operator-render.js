(() => {
  const container = document.querySelector("[data-operator-list]");
  if (!container) return;

  const role = container.dataset.operatorList;
  const create = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const renderOperator = (operator) => {
    const link = create("a", "card-link");
    link.href = operator.prts || `https://prts.wiki/w/${encodeURIComponent(operator.name)}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const card = create("div", "operator-card");
    const avatar = create("div", "operator-avatar");
    const image = document.createElement("img");
    image.src = operator.image;
    image.alt = operator.name;
    image.loading = "lazy";
    avatar.append(image);

    const info = create("div", "operator-info");
    info.append(
      create("h3", "operator-name", operator.name),
      create("p", "operator-level", `优先级：${operator.priority || "未填写"}`),
      create("p", "operator-mastery", `专精建议：${operator.mastery || ""}`),
      create("p", "operator-module", `模组建议：${operator.module || ""}`),
    );
    card.append(avatar, info);
    link.append(card);
    return link;
  };

  fetch("../data/operators.json", { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      const operators = (data.operators || []).filter((operator) => operator.profession === role);
      container.replaceChildren(...operators.map(renderOperator));
      if (operators.length === 0) {
        container.append(create("p", "operator-empty", "暂未收录干员。"));
      }
    })
    .catch(() => {
      container.replaceChildren(create("p", "operator-empty", "干员资料加载失败，请稍后刷新页面。"));
    });
})();
