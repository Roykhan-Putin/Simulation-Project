class SimMap {
  constructor(nodes, connections) {
    this.nodes = nodes;
    this.entrance = nodes.filter((node) => node.type == "entrance")[0];
    this.rides = nodes.filter((node) => node.type == "ride");
    this.edges = [];
    for (let connect of connections) {
      this.connectNode(connect[0], connect[1]);
    }

    // set the rideIDs
    for (let i = 0; i < this.rides.length; i++) {
      this.rides[i].setRideName(i + 1);
    }

    // run floyd warshall for setup()
    this.floydWarshall();
  }

  checkMap() {
    // regenerate entrance and ride lists
    const entrances = nodes.filter((node) => node.type == "entrance");
    this.rides = nodes.filter((node) => node.type == "ride");

    // check only 1 entrance
    if (entrances.length != 1) {
      return false;
    }
    this.entrance = entrances[0];

    // check that entrance reaches all nodes (use the bfs code)
    for (let node of this.rides) {
      const p = this.bfsCheck(this.entrance, node);
      if (p == null) return false;
    }

    // set the rideIDs
    for (let i = 0; i < this.rides.length; i++) {
      this.rides[i].setRideName(i + 1);
    }

    // run floyd warshall for setup
    this.floydWarshall();

    return true;
  }

  connectNode(node1, node2) {
    const n1 = this.nodes[node1];
    const n2 = this.nodes[node2];
    
    // Hitung jarak layar sebagai representasi jarak riil (1 pixel layar ~ 1 meter)
    const d = dist(n1.x, n1.y, n2.x, n2.y);

    // Sekarang jarak "d" dilempar ke koneksinya
    n1.connect(n2, d);
    n2.connect(n1, d);

    const edge = [[n1.x, n1.y], [n2.x, n2.y]];
    this.edges.push(edge);
  }

  // taken from the pseudocode in wikipedia: https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm
  floydWarshall() {
    const N = this.nodes.length;
    this.dist = [];
    this.next = [];
    let i = 0;

    for (i = 0; i < N; i++) {
      let tDist = [];
      let tNext = [];
      for (let j = 0; j < N; j++) {
        tDist.push(Infinity);
        tNext.push(null);
      }
      this.dist.push(tDist);
      this.next.push(tNext);
    }

    for (i = 0; i < N; i++) {
      for (let edge of this.nodes[i].connections) {
        for (let j = 0; j < N; j++) {
          if (this.nodes[j] === edge[0]) {
            this.dist[i][j] = edge[1];
            this.next[i][j] = j;
            break;
          }
        }
      }
    }
    for (i = 0; i < N; i++) {
      this.dist[i][i] = 0;
      this.next[i][i] = i;
    }
    for (let k = 0; k < N; k++) {
      for (i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          if (this.dist[i][j] > this.dist[i][k] + this.dist[k][j]) {
            this.dist[i][j] = this.dist[i][k] + this.dist[k][j];
            this.next[i][j] = this.next[i][k];
          }
        }
      }
    }
    console.log("fw done");
  }

  // unfortunately, not O(1) time, but O(n) due to path reconstruction on the fly
  // but, this is faster than BFS and has distance-based traversal
  // although, it doesn't seem to have any noticeable difference?
  getPathToNode(startNode, targetNode) {
    if (startNode === targetNode) return [startNode, targetNode];
    // have to search for the indices, unfortunately
    let u, v;
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i] === startNode) u = i;
      else if (this.nodes[i] === targetNode) v = i;
    }

    if (this.next[u][v] === null) return []; // this should never happen

    let path = [startNode];
    while (u != v) {
      u = this.next[u][v];
      path.push(this.nodes[u]);
    }
    return path;
  }

  // need to keep this to ensure connectivity when doing checkMap()
  bfsCheck(startNode, targetNode) {
    let visited = new WeakMap();
    for (let node of this.nodes) {
      visited.set(node, false);
    }

    let queue = [];
    queue.push([startNode]);

    while (queue.length > 0) {
      const path = queue.shift();
      const node = path[path.length - 1];
      visited.set(node, true);
      if (node === targetNode) {
        return path;
      }
      for (let npair of node.connections) {
        const next = npair[0];
        if (visited.get(next)) continue;
        let npath = [];
        for (const pnode of path) npath.push(pnode);
        npath.push(next);
        queue.push(npath);
      }
    }
    return null;
  }

  updateRides() {
    for (let ride of this.rides) {
      ride.update();
    }
  }

drawMap(creatorMode) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  // ===== 1. DRAW PATHWAYS / PROMENADES =====
  // Base ambient shadow for all walkways
  stroke(isDark ? color(0, 0, 0, 90) : color(0, 0, 0, 22));
  strokeWeight(12);
  for (const edge of this.edges) {
    line(edge[0][0], edge[0][1], edge[1][0], edge[1][1]);
  }

  // Walkway outer curb / edging
  stroke(isDark ? color(48, 54, 72) : color(208, 204, 216));
  strokeWeight(9);
  for (const edge of this.edges) {
    line(edge[0][0], edge[0][1], edge[1][0], edge[1][1]);
  }

  // Walkway main surface (warm travertine in light, slate graphite in dark)
  stroke(isDark ? color(34, 38, 52) : color(240, 237, 244));
  strokeWeight(6);
  for (const edge of this.edges) {
    line(edge[0][0], edge[0][1], edge[1][0], edge[1][1]);
  }

  // Pavement decorative centerline (subtle M3 primary accent)
  stroke(isDark ? color(188, 194, 255, 45) : color(63, 81, 181, 40));
  strokeWeight(1);
  for (const edge of this.edges) {
    line(edge[0][0], edge[0][1], edge[1][0], edge[1][1]);
  }

  // ===== 2. DRAW NODES =====
  for (const node of this.nodes) {

    if (creatorMode) {
      stroke(isDark ? 188 : 63, isDark ? 194 : 81, isDark ? 255 : 181);
      strokeWeight(2);
      fill(node.fill);
      circle(node.x, node.y, NODE_RADIUS * 2);

    } else {

      if (node.type === "entrance") {
        // ===== GRAND ENTRANCE PORTAL =====
        push();
        const ex = node.x;
        const ey = node.y;

        // Welcome Plaza radial paved rings
        noStroke();
        fill(255, 179, 0, isDark ? 20 : 15);
        circle(ex, ey, 66);
        fill(255, 179, 0, isDark ? 40 : 30);
        circle(ex, ey, 46);

        // Plaza outer rim
        stroke(255, 193, 7, 140);
        strokeWeight(1.5);
        fill(isDark ? color(32, 28, 20) : color(255, 250, 240));
        circle(ex, ey, 32);

        // Golden portal disc
        noStroke();
        fill(255, 179, 0);
        circle(ex, ey, 22);

        // Turnstile / Gate Icon
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(12);
        textStyle(BOLD);
        text("⛩", ex, ey - 0.5);

        // "GERBANG UTAMA" M3 Badge
        const badgeW = 76;
        const badgeH = 16;
        const badgeY = ey + 18;
        fill(isDark ? color(24, 23, 28, 230) : color(255, 255, 255, 240));
        stroke(255, 179, 0, 180);
        strokeWeight(1);
        rect(ex - badgeW / 2, badgeY, badgeW, badgeH, 8);

        noStroke();
        fill(isDark ? 255 : 20);
        textSize(8);
        textStyle(BOLD);
        text("PINTU MASUK", ex, badgeY + badgeH / 2);
        pop();

      } else if (node.type === "junc") {
        // ===== JUNCTION WAYPOINT PLAZA =====
        push();
        noStroke();
        fill(isDark ? color(188, 194, 255, 50) : color(63, 81, 181, 40));
        circle(node.x, node.y, 14);

        stroke(isDark ? color(255, 255, 255, 40) : color(0, 0, 0, 25));
        strokeWeight(1);
        fill(isDark ? color(36, 40, 56) : color(245, 243, 250));
        circle(node.x, node.y, 8);

        noStroke();
        fill(isDark ? color(188, 194, 255) : color(63, 81, 181));
        circle(node.x, node.y, 3.5);
        pop();

      } else if (node.type === "ride") {
        // ===== MATERIAL 3 ELEVATED RIDE PEDESTAL =====
        push();
        const cx = node.x;
        const cy = node.y;
        const isOpen = node.isOpen();
        const queueTime = node.getQueueTime();
        const isHovered = dist(cx, cy, mouseX, mouseY) < 26;

        // Determine category theme color
        let catColor;
        if (node.rideCategory === "dewasa") {
          catColor = color(244, 63, 94); // Crimson / Coral for Thrill
        } else if (node.rideCategory === "anak-anak") {
          catColor = color(16, 185, 129); // Emerald for Kids
        } else {
          catColor = color(56, 189, 248); // Azure / Sky for General/Family
        }

        // Hover halo glow
        if (isHovered) {
          noFill();
          stroke(red(catColor), green(catColor), blue(catColor), 160);
          strokeWeight(2);
          circle(cx, cy, 50);
          fill(red(catColor), green(catColor), blue(catColor), 25);
          noStroke();
          circle(cx, cy, 48);
        }

        // Ambient drop shadow for the ride pedestal
        noStroke();
        fill(0, 0, 0, isDark ? 110 : 35);
        circle(cx + 1, cy + 2, 38);

        // Pedestal base disc
        if (isDark) {
          fill(28, 27, 34);
          stroke(red(catColor), green(catColor), blue(catColor), isOpen ? 170 : 60);
        } else {
          fill(255, 255, 255);
          stroke(red(catColor), green(catColor), blue(catColor), isOpen ? 190 : 70);
        }
        strokeWeight(1.8);
        circle(cx, cy, 34);

        // Inner decorative ring
        noFill();
        stroke(red(catColor), green(catColor), blue(catColor), isOpen ? 60 : 25);
        strokeWeight(1);
        circle(cx, cy, 28);

        // --- RIDE ICON GLYPH (Category/Ride-Specific) ---
        push();
        textAlign(CENTER, CENTER);
        const rName = node.rideName || "";

        if (!isOpen) {
          fill(isDark ? 130 : 150);
          textSize(13);
          textStyle(BOLD);
          text("✕", cx, cy);
        } else if (rName.includes("Halilintar") || rName.includes("Tornado") || rName.includes("Hysteria") || rName.includes("Alap") || rName.includes("Kereta Misteri")) {
          // Thrill / Coaster glyph
          stroke(catColor);
          strokeWeight(1.5);
          noFill();
          arc(cx - 3, cy + 1, 14, 14, -PI * 0.75, PI * 0.5);
          line(cx - 7, cy + 5, cx + 7, cy - 5);
        } else if (rName.includes("Arung") || rName.includes("Niagara") || rName.includes("Kontiki") || rName.includes("Karavel")) {
          // Water ride wave glyph
          stroke(catColor);
          strokeWeight(1.5);
          noFill();
          arc(cx - 4, cy, 8, 6, 0, PI);
          arc(cx + 4, cy, 8, 6, 0, PI);
        } else if (rName.includes("Biang Lala")) {
          // Ferris wheel glyph
          stroke(catColor);
          strokeWeight(1);
          noFill();
          circle(cx, cy, 14);
          line(cx - 6, cy, cx + 6, cy);
          line(cx, cy - 6, cx, cy + 6);
          line(cx - 4, cy - 4, cx + 4, cy + 4);
          line(cx - 4, cy + 4, cx + 4, cy - 4);
        } else if (rName.includes("Turangga") || rName.includes("Poci") || rName.includes("Ontang")) {
          // Carousel canopy glyph
          stroke(catColor);
          strokeWeight(1.3);
          noFill();
          triangle(cx - 7, cy + 2, cx + 7, cy + 2, cx, cy - 6);
          line(cx - 7, cy + 2, cx + 7, cy + 2);
        } else if (rName.includes("Istana Boneka") || rName.includes("Rumah") || rName.includes("Ice Age")) {
          // Castle turret / whimsical show
          stroke(catColor);
          strokeWeight(1.3);
          noFill();
          rect(cx - 6, cy - 3, 12, 8, 1);
          triangle(cx - 5, cy - 3, cx + 5, cy - 3, cx, cy - 8);
        } else {
          // General star / attraction spark
          fill(catColor);
          noStroke();
          circle(cx, cy, 6);
          stroke(catColor);
          strokeWeight(1.2);
          line(cx - 6, cy, cx + 6, cy);
          line(cx, cy - 6, cx, cy + 6);
        }
        pop();

        // --- FAST TRACK BADGE (⚡) ---
        if (node.hasFastTrack) {
          push();
          const ftx = cx + 12;
          const fty = cy - 12;
          fill(245, 158, 11);
          noStroke();
          circle(ftx, fty, 13);
          fill(0);
          textSize(8);
          textAlign(CENTER, CENTER);
          textStyle(BOLD);
          text("⚡", ftx, fty);
          pop();
        }

        // --- WAIT TIME MINI CHIP (Floating Top Badge) ---
        push();
        const chipY = cy - 23;
        let chipBg, chipFg, chipTxt;

        if (!isOpen) {
          chipBg = isDark ? color(60, 20, 20) : color(254, 226, 226);
          chipFg = color(220, 38, 38);
          chipTxt = "TUTUP";
        } else if (queueTime < 15) {
          chipBg = isDark ? color(20, 50, 35) : color(220, 252, 231);
          chipFg = isDark ? color(74, 222, 128) : color(22, 163, 74);
          chipTxt = `${Math.round(queueTime)}m`;
        } else if (queueTime < 30) {
          chipBg = isDark ? color(60, 45, 15) : color(254, 243, 199);
          chipFg = isDark ? color(251, 191, 36) : color(180, 83, 9);
          chipTxt = `${Math.round(queueTime)}m`;
        } else {
          chipBg = isDark ? color(70, 25, 25) : color(254, 226, 226);
          chipFg = isDark ? color(248, 113, 113) : color(220, 38, 38);
          chipTxt = `${Math.round(queueTime)}m`;
        }

        textSize(8);
        textStyle(BOLD);
        const ctw = textWidth(chipTxt) + 10;
        fill(chipBg);
        stroke(chipFg);
        strokeWeight(0.8);
        rect(cx - ctw / 2, chipY, ctw, 12, 6);

        noStroke();
        fill(chipFg);
        textAlign(CENTER, CENTER);
        text(chipTxt, cx, chipY + 6);
        pop();

        // --- RIDE NAME LABEL PILL (Bottom) ---
        push();
        const lblY = cy + 20;
        textSize(8);
        textStyle(BOLD);
        const lw = textWidth(rName) + 10;

        fill(isDark ? color(20, 19, 24, 230) : color(255, 255, 255, 240));
        stroke(isDark ? color(255, 255, 255, 25) : color(0, 0, 0, 20));
        strokeWeight(1);
        rect(cx - lw / 2, lblY, lw, 13, 4);

        noStroke();
        fill(isDark ? (isOpen ? color(230, 225, 235) : color(140, 135, 145)) : (isOpen ? color(28, 27, 32) : color(120, 115, 125)));
        textAlign(CENTER, CENTER);
        text(rName, cx, lblY + 6.5);
        pop();

        pop();
      }
    }
  }
}

  addNode(node) {
    nodes.push(node);
  }

  getRideInfoFromNode(startNode) {
    let retInfo = [];
    let startNodeIndex;
    let minQ = Infinity, maxQ = 0, minD = Infinity, maxD = 0;
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i] === startNode) {
        startNodeIndex = i;
        break;
      }
    }
    for (let i = 0; i < this.nodes.length; i++) {
      // we only want to get ride info (get queue time and distance)
      if (i != startNodeIndex && this.nodes[i].type == "ride" && this.nodes[i].isOpen()) {
        const queue = this.nodes[i].getQueueTime();
        const distance = this.dist[startNodeIndex][i];
        minQ = min(queue, minQ);
        maxQ = max(queue, maxQ);
        minD = min(distance, minD);
        maxD = max(distance, maxD);
        retInfo.push([distance, queue, this.nodes[i]]);
      }
    }
    // normalise this info (so that we can score the rides effectively)
    const rangeQ = max(maxQ - minQ, 0.1);
    const rangeD = max(maxD - minD, 1);
    // console.log(rangeQ + " " + rangeD);
    for (let i = 0; i < retInfo.length; i++) {
      retInfo[i][0] = 1 - (retInfo[i][0] - minD) / rangeD;
      retInfo[i][1] = 1 - (retInfo[i][1] - minQ) / rangeQ;
    }
    return retInfo;
  }

  getAverageQueueTime() {
    let totalQueueTimes = 0;
    let validRidesCount = 0;
    
    for (let ride of this.rides) {
      // HANYA hitung wahana reguler (yang memiliki antrean fisik)
      if (!ride.isContinuous) {
        totalQueueTimes += ride.getQueueTime();
        validRidesCount++;
      }
    }
    
    if (validRidesCount === 0) return 0;
    return totalQueueTimes / validRidesCount;
  }

  getMinQueueTime() {
    let minQueueTime = Infinity;
    for (let ride of this.rides) {
      // HANYA cari waktu minimum dari wahana yang memiliki antrean fisik
      if (!ride.isContinuous) {
        if (ride.getQueueTime() < minQueueTime) {
          minQueueTime = ride.getQueueTime();
        }
      }
    }
    return minQueueTime === Infinity ? 0 : minQueueTime;
  }
}

class MapNode {
  constructor(type, x, y) {
    this.type = type;
    this.typeIndex = NODE_TYPES.findIndex(t => t === this.type);

    const MAP_SCALE_X = 0.78; 
    const MAP_SCALE_Y = 0.58; 
    const OFFSET_X = 280; 
    const OFFSET_Y = 48; 

    this.x = (x * WIDTH * MAP_SCALE_X) + OFFSET_X;
    this.y = (y * HEIGHT * MAP_SCALE_Y) + OFFSET_Y;
    this.connections = [];

    // --- FITUR BARU ---
    this.rideCategory = "umum"; 
    this.isContinuous = false;

    this.openHour = 10;
    this.openMinute = 0;
    this.closeHour = 19;
    this.closeMinute = 0;

    this.waitLimit = 3;
    this.waitTimer = 0;
    this.isWaiting = false;

    this.setTypePars();

    this.popularity = true;
    this.isPopular = false;
    this.hasFastTrack = false;
    this.minHeight = 120;
    this.capacity = 10;
    this.minCapacity = 5;
    this.queuePeopleCount = 0;
    this.zone = 0;

    this.lambda = 0;
    this.arrivalsInLastMinute = 0;
    this.lambdaHistory = [];
    this.lastLambdaUpdate = secondsInSim;
  }

  isOpen(){
    if(this.type !="ride") return true;
    const nowTime = currentHour + currentMinute / 60;
    const openTime = this.openHour + this.openMinute / 60;
    const closeTime = this.closeHour + this.closeMinute / 60;
    return nowTime >= openTime && nowTime <= closeTime;
  }
  
  setTypePars() {
    this.fill = "black";
    this.img = null;
    if (this.type == "entrance") {
      this.fill = "#a50";
      this.img = loadImage(ENTRANCE_IMG_PATH);
    } else if (this.type == "ride") {
      this.fill = "#0ab";
      this.img = loadImage(RIDE_IMG_PATH);
      this.setRideParameters(10, getRandomRuntime(), getRandomTurnover());
      this.queueHist = [0];
    }
  }

  setRideName(rideID) { this.rideName = `Ride ${rideID}`; }

  // Hitung jumlah orang yang SECARA FISIK sedang bermain di wahana ini
  getCurrentOccupancy() {
    let occ = 0;
    for (let batch of this.ridingAgents) {
      for (let agt of batch) occ += agt.size;
    }
    return occ;
  }

  getQueueTime() {
    if (this.type == "ride") {
      
      // 1. PENANGANAN WAHANA KONTINYU (Misal: Istana Boneka / Rumah Kaca)
      if (this.isContinuous) {
        // Alih-alih mengembalikan 999 (yang bisa merusak rata-rata matematis),
        // kita gunakan interval jeda antrean rasional jika wahana sedang penuh.
        if (this.getCurrentOccupancy() >= this.capacity) {
            let dispatchInterval = this.interval || 1; // Jeda antar perahu/orang masuk
            return Math.ceil(this.queuePeopleCount / this.capacity) * dispatchInterval;
        } else {
            return 0; // Langsung masuk jika belum penuh
        }
      }

      // 2. PENANGANAN WAHANA BATCH (Misal: Halilintar / Tornado)
      // Waktu 1 Siklus Penuh = Durasi Main + Waktu Bongkar Muat
      let fullCycleTime = (this.runtime || 5) + (this.turnover || 2);
      
      // Jumlah putaran yang harus ditunggu
      let numberOfCycles = Math.ceil(this.queuePeopleCount / this.capacity);
      
      return numberOfCycles * fullCycleTime;
      
    } else {
      return 0; // Untuk node tipe 'junc' (persimpangan) atau 'entrance'
    }
  }

  reset() {
    this.queue = new PriorityQueue((a, b) => a[0] > b[0]);
    this.ridingAgents = [];
    this.runCooldowns = [];
    this.turnoverCooldown = 0;
    this.queueHist = [0];
    this.queuePeopleCount = 0;
    // ✅ FIX: Reset lambda tracking agar rho tidak warisi nilai dari run sebelumnya
    this.lambda = 0;
    this.arrivalsInLastMinute = 0;
    this.lambdaHistory = [];
    this.lastLambdaUpdate = 0;
  }

  getType() { return this.type; }

  getDisplayInfo() {
    if (this.type != 'ride') return "";
    let statusText = this.isContinuous 
      ? `Occupancy: ${this.getCurrentOccupancy()} / ${this.capacity} (Walk-through)` 
      : `Queue time: ${this.getQueueTime()} minutes`;

    let timeText = this.isContinuous
      ? `Max Play Time: ${this.runtime} mins`
      : `Runtime: ${this.runtime} mins | Turnover: ${this.turnover} mins`;

    let reqText = `Min Height: ${this.minHeight > 0 ? this.minHeight + " cm" : "None"} | Fast Track: ${this.hasFastTrack ? "✅ Yes" : "❌ No"}`;

    const m = this.getQueueMetrics();

    // Penjelasan stabilitas ρ yang akurat secara teori:
    // ρ < 1  → steady-state terjamin, sistem pasti mengosongkan diri
    // ρ >= 1 → tidak ada jaminan steady-state, TAPI karena kedatangan bersifat
    //           acak (Poisson), bisa ada periode panjang tanpa pelanggan sehingga
    //           server sempat mengosongkan sistem → bisa stabil sementara
    const rhoNote = m.rho >= 1
      ? `⚠ ρ≥1: tidak steady-state, tapi kedatangan\n  acak bisa ciptakan periode kosong`
      : `✓ ρ<1: sistem steady-state terjamin`;

    // Performa sistem dinilai dari 4 metrik bersama-sama:
    // ρ (stabilitas) + Lq (panjang antrian) + W (waktu tunggu) + S (total waktu di sistem)
    let metricsText =
      `ρ  : ${m.rho.toFixed(3)} (${(m.rho*100).toFixed(1)}%)  ${m.status}\n` +
      `${rhoNote}\n` +
      `─────────────────────\n` +
      `L  : ${m.L.toFixed(2)}  (rata-rata dlm sistem)\n` +
      `Lq : ${m.Lq.toFixed(2)}  (rata-rata dlm antrian)\n` +
      `W  : ${m.W.toFixed(1)} mnt  (waktu tunggu antrian)\n` +
      `S  : ${m.S.toFixed(1)} mnt  (total waktu di sistem)`;

    let fullMetrics = `\n\n[TEORI ANTRIAN M/M/1]\n` + metricsText;

    return `===${this.rideName || "Ride"}===\n` + 
           `Kategori: ${this.rideCategory.toUpperCase()}\n` + 
           `Zone: ${this.zone}\n` +
           `${reqText}\n` +
           `Capacity: ${this.capacity} | Min: ${this.minCapacity || 0}\n` +
           `${timeText}\n` + 
           `${statusText}\n` + 
           `Buka: ${this.openHour.toString().padStart(2, '0')}:${this.openMinute.toString().padStart(2, '0')} WIB\n` +
           `Status: ${this.isWaiting ? "Waiting (" + Math.floor(this.waitTimer) + "s)" : "Ready"}\n` +
           fullMetrics;
  }

  toggleType() {
    this.typeIndex = (this.typeIndex + 1) % NODE_TYPES.length;
    this.type = NODE_TYPES[this.typeIndex];
    this.setTypePars();
  }

  setRideParameters(capacity, runtime, turnover) {
    this.capacity = capacity;
    this.runtime = runtime;
    this.turnover = turnover;
    this.ridingAgents = [];
    this.queue = new PriorityQueue((a, b) => a[0] > b[0]); 
    this.runCooldowns = [];
    this.turnoverCooldown = 0;
  }

  enqueue(agent, priority) {
    // 🔥 PERBAIKAN FATAL: Memastikan Antrean Murni FIFO (First-In First-Out)
    // Priority = 1 (FastTrack) bernilai 1.000.000. 
    // Kita kurangi dengan waktu kedatangan (secondsInSim) agar yang antre 
    // lebih dulu (waktu lebih kecil) memiliki nilai prioritas absolut yang lebih tinggi!
    let finalPriority = (priority * 1000000) - secondsInSim;
    this.arrivalsInLastMinute += agent.size;
    
    this.queue.push([finalPriority, agent]);
    this.queuePeopleCount += agent.size; 
    agent.startQueueing();
  }

  // Khusus Wahana Tanpa Antre: Pengunjung Langsung Masuk!
  admitContinuous(agent) {
    agent.startRiding();
    this.arrivalsInLastMinute += agent.size;
    this.ridingAgents.push([agent]); // Masuk sebagai batch independen
    
    // LOGIKA BARU: DURASI BERMAIN ANAK-ANAK YANG REALISTIS
    // Anak-anak akan bermain acak antara 50% sampai 100% dari Max Play Time (Runtime)
    // Jika Max Play Time = 60 menit, mereka akan keluar antara menit ke-30 hingga menit ke-60.
    let playDuration = this.runtime * (0.5 + 0.5 * Math.random()); 
    
    this.runCooldowns.push(playDuration * 60); // Masukkan ke timer waktu nyata
  }

  drawGraph() {
    if (this.type == "ride" && !this.isContinuous) {
      const maxHist = max(1, max(this.queueHist));
      const minHist = 0;
      textAlign(CENTER, BOTTOM);
      fill(0);
      noStroke();
      text(maxHist, RG_X_START, RG_Y_START);
      stroke(0);
      strokeWeight(1);
      line(RG_X_START, RG_Y_START, RG_X_START, RG_Y_END);
      line(RG_X_START, RG_Y_END, RG_X_END, RG_Y_END);
      stroke(255, 0, 0);
      strokeWeight(0.5);
      noFill();
      beginShape();
      for (let i = 0; i < MAX_RIDE_SAMPLES; i++) {
        if (i < this.queueHist.length) {
          const xtick = (RG_X_END - RG_X_START) / MAX_RIDE_SAMPLES * i + RG_X_START;
          const ytick = RG_Y_END - (RG_Y_END - RG_Y_START) / (maxHist - minHist) * (this.queueHist[i] - minHist);
          vertex(xtick, ytick);
        }
      }
      endShape();
    }
  }

  update() {
    if (this.type == "ride" && frameRunning % Math.floor(RIDE_SAMPLE_UPDATE_FREQ * FRAME_RATE) == 0) {
      const queueTime = int(ceil(this.queue.size() / max(1, this.capacity))) * this.turnover;
      this.queueHist.push(queueTime);
      if (this.queueHist.length > MAX_RIDE_SAMPLES) this.queueHist.shift();
    }

    if (this.type == "ride") {
      if (this.turnoverCooldown > 0) {
        this.turnoverCooldown = max(0, this.turnoverCooldown - deltaTime / 1000 * TIME_ACCELERATION);
      }

      // 🔥 PENGUSIRAN PAKSA SAAT JAM MALAM (Mencegah Simulasi Stuck)
      if (!this.isOpen()) { 
        // 1. Usir Antrean
        let size = this.queue.size();
        for (let i = 0; i < size; i++) { 
          let agt = this.queue.pop()[1];
          agt.handleTimeout(this); 
        }
        // 2. Usir yang sedang main (Force Stop)
        for (let i = 0; i < this.ridingAgents.length; i++) {
            for (let agt of this.ridingAgents[i]) {
                agt.doneRiding(); 
            }
        }
        this.ridingAgents = [];
        this.runCooldowns = [];
        this.isWaiting = false;
        this.waitTimer = 0;
        this.queuePeopleCount = 0; // 🔥 TAMBAHKAN INI AGAR RESET KE NOL!
        return; // Hentikan proses lebih lanjut
      }

      // 🔥 UPDATE WAKTU MAIN (Berjalan Normal)
      if (this.runCooldowns.length > 0) {
        let i = 0;
        while (i < this.runCooldowns.length) {
          this.runCooldowns[i] -= deltaTime / 1000 * TIME_ACCELERATION;
          if (this.runCooldowns[i] <= 0) {
            // Agen Selesai Main
            for (const agt of this.ridingAgents[i]) {
              agt.doneRiding();
            }
            // Hapus dari array
            this.runCooldowns.splice(i, 1);
            this.ridingAgents.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      // 🔥 PROSES MASUK ANTREAN
      if (!this.queue.isEmpty()) {
        if (!this.isWaiting) {
          this.isWaiting = true;
          this.waitTimer = 0;
        }
        this.waitTimer += (deltaTime / 1000) * TIME_ACCELERATION;

        let nameLow = this.name ? this.name.toLowerCase() : "";
        let isPulseRide = nameLow.includes("biang") || nameLow.includes("boneka") || nameLow.includes("niagara") || nameLow.includes("arung") || nameLow.includes("riana");

        if (this.turnoverCooldown <= 0) {
          if (this.isContinuous) {
            // HITUNG KAPASITAS RUANGAN DENGAN AMAN
            let peopleInside = 0;
            for (let g of this.ridingAgents) {
              for (let a of g) {
                  peopleInside += (a.groupSize || a.size || 1);
              }
            }
            // Jika ada sisa kursi ATAU ada orang tapi udah nunggu kelamaan
            if (peopleInside < this.capacity || this.waitTimer >= (this.waitLimit * 60)) {
               this.startRideAction(peopleInside); // Oper pass parameter
            }
          } else {
            let currentCap = isPulseRide ? this.capacity : this.capacity; 
            if (this.queue.size() >= currentCap || this.waitTimer >= (this.waitLimit * 60)) {
              this.startRideAction(0);
            }
          }
        }
      } else {
        this.isWaiting = false;
        this.waitTimer = 0;
      }
    }
    this.updateArrivalRate();
  }

  // 🔥 VERSI 100% ANTI-FREEZE & CRASH-PROOF
  startRideAction(peopleInside = 0) {
    this.isWaiting = false;
    this.waitTimer = 0;

    let currentCapacity = this.capacity; 
    let currentTurnover = this.turnover; 
    let currentRuntime = this.runtime || this.turnover; 

    // Pengecekan nama wahana dengan aman
    if (this.name && (this.name.toLowerCase().includes("biang") || this.name.toLowerCase().includes("boneka") || this.name.toLowerCase().includes("niagara") || this.name.toLowerCase().includes("arung") || this.name.toLowerCase().includes("riana"))) {
        currentTurnover = 0.5; 
    } else if (this.isContinuous) {
        currentCapacity = Math.max(1, this.capacity - peopleInside); 
        currentTurnover = 0.05; 
    }

    this.turnoverCooldown = currentTurnover * 60; 
    
    let peopleLoaded = 0;
    let loadedAgents = [];
    let loopGuard = 0; // Pelindung dari Infinite Loop

    while (!this.queue.isEmpty() && peopleLoaded < currentCapacity) {
      loopGuard++;
      if (loopGuard > 100) break; // Paksa berhenti jika melebihi 100 putaran (Mencegah Freeze)

      let item = this.queue.pop();
      let agt = item[1];
      if (!agt) continue; // Lewati jika data agen rusak

      let remainingSeats = currentCapacity - peopleLoaded;
      let cannotSplit = (agt.type === "GROUP_FAMILY" && this.rideCategory === "umum" && agt.size <= this.capacity);

      if (agt.size > remainingSeats && !cannotSplit && remainingSeats > 0) {
          let ridingPart = agt.cloneSplit(remainingSeats, false);
          ridingPart.isCapacitySplit = true; 
          
          agt.size -= remainingSeats;
          this.queue.push([item[0] + 5000000, agt]); // Sisanya dikembalikan dengan prioritas tinggi
          
          ridingPart.startRiding();
          loadedAgents.push(ridingPart); 
          peopleLoaded += ridingPart.size;
          agents.push(ridingPart); 
          
      } else if (agt.size <= remainingSeats) {
        agt.startRiding();
        loadedAgents.push(agt);
        peopleLoaded += agt.size;
      } else {
        // Jika tidak muat, kembalikan ke antrean dan akhiri sesi muat
        this.queue.push([item[0] + 5000000, agt]); 
        break;
      }
    }

    // Kalkulasi pengurangan antrean ditaruh di luar loop agar lebih stabil
    if (!this.isContinuous && this.queuePeopleCount !== undefined) {
        this.queuePeopleCount = Math.max(0, this.queuePeopleCount - peopleLoaded);
    }

    if (loadedAgents.length > 0) {
        this.ridingAgents.push(loadedAgents);
        this.runCooldowns.push(currentRuntime * 60); 
    }
  }
  updateArrivalRate(){
    const now = secondsInSim;
    if (now - this.lastLambdaUpdate >= 60){
      const lambdaThisMin = this.arrivalsInLastMinute;
      this.lambdaHistory.push(lambdaThisMin);
      if(this.lambdaHistory.length > 5) this.lambdaHistory.shift();

      this.lambda = this.lambdaHistory.length > 0 ? this.lambdaHistory.reduce((a,b) => a + b, 0) / this.lambdaHistory.length : 0.01;
      
      this.arrivalsInLastMinute = 0;
      this.lastLambdaUpdate = now;
    }
  }

  getQueueMetrics(){
    return getQueueMetrics(this);
  }

  connect(other, distance) {
    this.connections.push([other, distance]);
  }
}