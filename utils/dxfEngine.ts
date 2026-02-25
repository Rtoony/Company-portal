
// A lightweight DXF Parser for demonstration purposes.
// In a full production app, you might use 'dxf-parser' from npm.

export interface Point { x: number; y: number; }

export interface DxfEntity {
  type: 'LINE' | 'LWPOLYLINE' | 'CIRCLE' | 'ARC' | 'TEXT' | 'MTEXT';
  layer: string;
  points: Point[]; // For lines/polylines
  center?: Point;  // For circles/arcs/text position
  radius?: number; // For circles/arcs
  text?: string;   // For TEXT/MTEXT
  rotation?: number; // Degrees
  height?: number; // Text height
}

export interface DxfData {
  entities: DxfEntity[];
  layers: string[];
  extents: { min: Point; max: Point; width: number; height: number; center: Point };
}

export class DxfEngine {
  
  static parse(dxfString: string): DxfData {
    const lines = dxfString.split(/\r?\n/);
    const entities: DxfEntity[] = [];
    const layers = new Set<string>();
    
    let currentEntity: Partial<DxfEntity> | null = null;
    let section = '';
    
    // Helper to finish an entity
    const pushEntity = () => {
      if (currentEntity && currentEntity.type) {
        // Validation
        if (currentEntity.type === 'LINE' && currentEntity.points?.length === 2) entities.push(currentEntity as DxfEntity);
        if (currentEntity.type === 'LWPOLYLINE' && (currentEntity.points?.length || 0) > 1) entities.push(currentEntity as DxfEntity);
        if (currentEntity.type === 'CIRCLE') entities.push(currentEntity as DxfEntity);
        if ((currentEntity.type === 'TEXT' || currentEntity.type === 'MTEXT') && currentEntity.text && currentEntity.center) entities.push(currentEntity as DxfEntity);
        
        if (currentEntity.layer) layers.add(currentEntity.layer);
      }
      currentEntity = null;
    };

    for (let i = 0; i < lines.length; i++) {
      const code = lines[i].trim();
      const value = lines[i + 1]?.trim();
      i++; // Skip value line in next loop

      if (code === '0' && value === 'SECTION') continue;
      if (code === '2' && value === 'ENTITIES') { section = 'ENTITIES'; continue; }
      if (code === '0' && value === 'ENDSEC') { section = ''; continue; }

      if (section === 'ENTITIES') {
        if (code === '0') {
          // New Entity Start
          pushEntity(); // Push previous if exists
          
          if (['LINE', 'LWPOLYLINE', 'CIRCLE', 'TEXT', 'MTEXT'].includes(value)) {
            currentEntity = { type: value as any, points: [] };
          }
        } else if (currentEntity) {
          // Attribute parsing
          if (code === '8') currentEntity.layer = value;
          
          // LINE
          if (currentEntity.type === 'LINE') {
            if (!currentEntity.points) currentEntity.points = [{x:0, y:0}, {x:0, y:0}];
            if (code === '10') currentEntity.points[0].x = parseFloat(value);
            if (code === '20') currentEntity.points[0].y = parseFloat(value);
            if (code === '11') currentEntity.points[1].x = parseFloat(value);
            if (code === '21') currentEntity.points[1].y = parseFloat(value);
          }

          // CIRCLE
          if (currentEntity.type === 'CIRCLE') {
            if (!currentEntity.center) currentEntity.center = {x:0, y:0};
            if (code === '10') currentEntity.center.x = parseFloat(value);
            if (code === '20') currentEntity.center.y = parseFloat(value);
            if (code === '40') currentEntity.radius = parseFloat(value);
          }

          // LWPOLYLINE
          if (currentEntity.type === 'LWPOLYLINE') {
            if (code === '10') {
               // New Vertex X
               currentEntity.points!.push({ x: parseFloat(value), y: 0 }); 
            }
            if (code === '20') {
               // Current Vertex Y (update the last point added)
               const lastIdx = currentEntity.points!.length - 1;
               if (lastIdx >= 0) currentEntity.points![lastIdx].y = parseFloat(value);
            }
          }

          // TEXT / MTEXT
          if (currentEntity.type === 'TEXT' || currentEntity.type === 'MTEXT') {
             if (!currentEntity.center) currentEntity.center = {x:0, y:0};
             if (code === '1') currentEntity.text = value; // Text Content
             // MText specific: Code 3 could be additional text, ignore for simple prototype
             if (code === '10') currentEntity.center.x = parseFloat(value);
             if (code === '20') currentEntity.center.y = parseFloat(value);
             if (code === '40') currentEntity.height = parseFloat(value);
             if (code === '50') currentEntity.rotation = parseFloat(value);
          }
        }
      }
    }
    pushEntity(); // Push final

    return {
      entities,
      layers: Array.from(layers).sort(),
      extents: this.calculateExtents(entities)
    };
  }

  static calculateExtents(entities: DxfEntity[]) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    entities.forEach(ent => {
      const pts = ent.points || [];
      if (ent.center) pts.push(ent.center); // Include circle centers / text insertion points
      
      pts.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      });
    });

    // Fallback for empty
    if (minX === Infinity) { minX = 0; minY = 0; maxX = 100; maxY = 100; }

    // Add padding (5%)
    const width = maxX - minX;
    const height = maxY - minY;
    const paddingX = width * 0.05;
    const paddingY = height * 0.05;

    return {
      min: { x: minX - paddingX, y: minY - paddingY },
      max: { x: maxX + paddingX, y: maxY + paddingY },
      width: width + (paddingX * 2),
      height: height + (paddingY * 2),
      center: { x: minX + width/2, y: minY + height/2 }
    };
  }
}
