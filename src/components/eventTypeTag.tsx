import React from 'react';
import './eventTypeTag.css'

type Props = {
  eventType: string;
};

const EventTypeTag: React.FC<Props> = ({ eventType }) => {
    let eventTypeStyling: string;

    switch (eventType.toLocaleLowerCase()) {
        case 'triathlon':
            eventTypeStyling = 'triathlon-tag';
            break;
        case 'run':
            eventTypeStyling = 'run-tag';
            break;
        default:
            eventTypeStyling = 'other-tag';
            break;
    }

    return (
    <div className={`tag-box ${eventTypeStyling}`}>
        <i className="indicator"></i>
        <span>{eventType}</span>
    </div>
    );
};

export default EventTypeTag;
