import PropTypes from 'prop-types';
import shortId from 'shortid';
import Button from '../ui/Button';

const OperationSection = ({ handleArithmeticOps, handleClearOps }) => {
    const operations = [
        {
            id: shortId.generate(),
            text: '+',
            onClick: () => handleArithmeticOps('+'),
        },
        {
            id: shortId.generate(),
            text: '-',
            onClick: () => handleArithmeticOps('-'),
        },
        {
            id: shortId.generate(),
            text: '*',
            onClick: () => handleArithmeticOps('*'),
        },
        {
            id: shortId.generate(),
            text: '/',
            onClick: () => handleArithmeticOps('/'),
        },
        {
            id: shortId.generate(),
            text: '%',
            onClick: () => handleArithmeticOps('%'),
        },
        {
            id: shortId.generate(),
            text: '**',
            onClick: () => handleArithmeticOps('**'),
        },
        {
            id: shortId.generate(),
            text: 'Clear',
            onClick: handleClearOps,
        },
    ];
    return (
        <div>
            <p>Operations</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {operations.map((operation) => (
                    <Button
                        text={operation.text}
                        onClick={operation.onClick}
                        key={operation.id}
                    />
                ))}
            </div>
        </div>
    );
};

OperationSection.propTypes = {
    handleArithmeticOps: PropTypes.func.isRequired,
    handleClearOps: PropTypes.func.isRequired,
};

export default OperationSection;