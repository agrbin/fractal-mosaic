<?php

if (count(array_keys($_GET)) !== 1) {
  echo "<script>document.location = '?0';</script>";
  exit;
}

class Index {
  private $index;
  const WIKI_LINK = "http://commons.wikimedia.org/wiki/File:";
  public function __construct($id) {
    $this->index = file("../crop-index.txt");
    foreach ($this->index as &$row) {
      $row = explode(" ", $row);
    }
    echo "<h1><a href=\"{$this->getLink($id)}\">";
    echo "{$this->getName($id)}</a></h1>";
  }
  public function getName($id) {
    return end(explode("/", $this->index[$id][1]));
  }
  public function getLink($id) {
    return Index::WIKI_LINK . $this->getName($id);
  }
};

class Image {
  private $html;
  public $link;
  public function __construct($id, $href, $link) {
    $this->html = "<img src=\"$href\"/>";
    $this->link = $link;
    if ($this->link) {
      $this->html = "<a href=\"?$id\">$this->html</a>";
    }
  }
  public function render() {
    return $this->html;
  }
};

class Table {
  public function __construct() {
    echo "<div class=\"table\">";
  }
  public function startRow() {
    echo "<div class=\"row\">\n";
  }
  public function addImage(Image $im) {
    echo "  " . $im->render() . "\n";
  }
  public function endRow() {
    echo "</div>\n";
    echo "<div class=\"clear\"></div>\n";
  }
  public function endTable() {
    echo "</div>";
  }
}

class Mosaic {
  const DATA_DIR="../../output";
  const kRows = 32;
  const kCols = 32;

  public function __construct($id) {
    $mosaic = $this->loadMosaic($id);
    if ($mosaic === false) {
      exit("there is no mosaic calculated for this file yet");
    }
    $table = new Table();
    for ($i = 0; $i < Mosaic::kRows; ++$i) {
      $table->startRow();
      for ($j = 0; $j < Mosaic::kCols; ++$j) {
        $id = $mosaic[Mosaic::kRows * $i + $j];
        $table->addImage(new Image(
          $id,
          $this->getHref($id),
          $this->fileExists($id)
        ));
      }
      $table->endRow();
    }
  }

  private function getHref($id) {
    return sprintf("small/%d.bmp", $id);
  }

  private function getOutFile($id) {
    $id = (int) $id;
    return sprintf("%s/%d-%d.out.json",
      Mosaic::DATA_DIR, (int) ($id / 100) * 100, (int) (1 + $id / 100) * 100
    );
  }

  private function fileExists($id) {
    return file_exists($this->getOutFile($id));
  }

  private function loadMosaic($id) {
    $mosaic = null;
    $file = $this->getOutFile($id);
    if (!file_exists($file)) {
      return false;
    }
    $mosaic = json_decode(file_get_contents($file), true);
    return $mosaic[$id];
  }

};

?>
<!doctype>
<html>
  <head>
    <title>fractal-mosaic dummy viz</title>
    <link rel="stylesheet" type="text/css" href="main.css">
  </head>
  <body>
  <?php
    new Mosaic(reset(array_keys($_GET)));
    new Index(reset(array_keys($_GET)));
  ?>
  </body>
</html>

