#!/bin/bash

echo "📦 Installing UI Dependencies..."

npm install \
  clsx \
  react-hot-toast \
  lucide-react \
  framer-motion \
  react-masonry-css

echo "✅ Installation complete!"
echo ""
echo "Checking installation..."
npm list clsx react-hot-toast lucide-react framer-motion react-masonry-css --depth=0


