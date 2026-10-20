export function getNextUnselectedCategory(
  categories: { id: string }[],
  selections: Record<string, string>,
  currentCategoryId: string,
): string | null {
  const currentIndex = categories.findIndex(
    (category) => category.id === currentCategoryId,
  );
  if (currentIndex < 0 || categories.length < 2) return null;

  for (let offset = 1; offset < categories.length; offset += 1) {
    const category = categories[(currentIndex + offset) % categories.length];
    if (!selections[category.id]) return category.id;
  }

  return null;
}
