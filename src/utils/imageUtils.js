// imageUtils.js
export const getImageUrl = (imageName) => {
    try {
      return require(`../assets/images/${imageName}`).default;
    } catch (error) {
      console.error(`Image not found: ${imageName}`);
      return null;
    }
  };