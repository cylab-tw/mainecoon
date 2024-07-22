import { Icon } from '@iconify/react';
import mdiEllipseOutline from '@iconify-icons/mdi/ellipse-outline';
import mdiRectangleOutline from '@iconify-icons/mdi/rectangle-outline';
import mdiVectorPoint from '@iconify-icons/mdi/vector-point';
import mdiVectorPolygon from '@iconify-icons/mdi/vector-polygon';
import mdiVectorPolyline from '@iconify-icons/mdi/vector-polyline';

/** A button group for picking a geometry type to create/select annotations. */
export default function GeometryPicker({className, buttonClassName, onClick, onPick }) {
    const GraphicType  = {
        Point : 'POINT',
        Polyline : 'POLYLINE',
        Polygon : 'POLYGON',
        Ellipse : 'ELLIPSE',
        Rectangle : 'RECTANGLE'
    }

    const drawTypes = [
        { icon: mdiVectorPoint, graphicType: GraphicType.Point },
        { icon: mdiVectorPolyline, graphicType: GraphicType.Polyline },
        { icon: mdiVectorPolygon, graphicType: GraphicType.Polygon },
        { icon: mdiEllipseOutline, graphicType: GraphicType.Ellipse },
        { icon: mdiRectangleOutline, graphicType: GraphicType.Rectangle },
    ];

    return (
        <div className={`items-center ${className || ''}`}>
            {drawTypes.map((type) => (
                <div key={type.graphicType} className={`flex flex-col rounded hover:bg-green-300  ${buttonClassName || ''}`}>
                <button
                    key={type.graphicType}
                    type="button"
                    className="block flex rounded p-2"
                    onClick={(e) => {
                        onClick?.(e);
                        onPick?.(type.graphicType);
                    }}
                >
                    <Icon icon={type.icon} className="mr-2 h-5 w-5" />
                    <span className="text-sm">{type.graphicType}</span>
                </button>
                </div>
            ))}
        </div>
    );
}
