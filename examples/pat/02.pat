action top (
  repeat 500 (
    fire (
        repeat 10 (
            wait 60;
            speed 0;
            wait 60;
            speed 1;
        );
    );
    wait 15;
  );
);
